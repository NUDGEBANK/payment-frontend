import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ApiError } from '../../api/client'
import { createPaymentSession, fetchCatalog } from '../../api/userApi'
import { useUserApp } from '../../app/providers/UserAppProvider'
import { PaymentSummary, ProductCard } from '../../components/payment'
import { AppFrame, BottomNav, Content, PageHeader, PillButton } from '../../components/ui'
import type { Category, Market, MenuItem } from '../../types/payment'

const menuImageModules = import.meta.glob('../../assets/*', {
  eager: true,
  import: 'default',
}) as Record<string, string>

const getMenuImage = (menuId: number) => {
  return menuImageModules[`../../assets/${menuId}.png`] ?? menuImageModules[`../../assets/${menuId}.jpg`] ?? ''
}

export function ShopPage() {
  const navigate = useNavigate()
  const { card, setActivePayment } = useUserApp()
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [selectedMarketId, setSelectedMarketId] = useState<number | null>(null)
  const [selectedMenuId, setSelectedMenuId] = useState<number | null>(null)
  const [quantity, setQuantity] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCatalog().then((data) => {
      setCategories(data.categories)
      setSelectedCategoryId(data.categories[0]?.categoryId ?? null)
    })
  }, [])

  const currentCategory = useMemo(
    () => categories.find((category) => category.categoryId === selectedCategoryId) ?? null,
    [categories, selectedCategoryId],
  )
  const markets = currentCategory?.markets ?? []
  const currentMarket = useMemo(
    () => markets.find((market) => market.marketId === selectedMarketId) ?? markets[0] ?? null,
    [markets, selectedMarketId],
  )
  const currentMenu = useMemo(
    () => currentMarket?.menus.find((menu) => menu.menuId === selectedMenuId) ?? null,
    [currentMarket, selectedMenuId],
  )

  useEffect(() => {
    setSelectedMarketId(markets[0]?.marketId ?? null)
  }, [selectedCategoryId, markets])

  useEffect(() => {
    setSelectedMenuId(currentMarket?.menus[0]?.menuId ?? null)
    setQuantity(0)
  }, [currentMarket])

  if (!card) {
    return <Navigate to="/user/register" replace />
  }

  const handleMenuChange = (menu: MenuItem, nextQuantity: number) => {
    setSelectedMenuId(menu.menuId)
    setQuantity(nextQuantity)
  }

  const totalAmount = currentMenu ? currentMenu.price * quantity : 0

  const handleBuy = async () => {
    if (!card || !currentMarket || !currentMenu || quantity <= 0) {
      return
    }

    try {
      setError('')
      const session = await createPaymentSession({
        cardId: card.cardId,
        marketId: currentMarket.marketId,
        menuName: currentMenu.menuName,
        quantity,
        paymentAmount: totalAmount,
      })
      setActivePayment(session)
      navigate(`/user/payment/qr?qrId=${session.qrId}`)
    } catch (caught) {
      if (caught instanceof ApiError) {
        setError(caught.code === 'INSUFFICIENT_BALANCE' ? '잔액이 부족합니다.' : caught.message || caught.code)
      } else {
        setError('결제 요청 생성에 실패했습니다.')
      }
    }
  }

  return (
    <AppFrame>
      <PageHeader title="상품 선택" backTo="/user" />
      <Content>
        <div className="space-y-5">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((category) => (
              <PillButton
                key={category.categoryId}
                active={category.categoryId === selectedCategoryId}
                onClick={() => setSelectedCategoryId(category.categoryId)}
              >
                {category.categoryName}
              </PillButton>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {markets.map((market: Market) => (
              <PillButton
                key={market.marketId}
                active={market.marketId === currentMarket?.marketId}
                onClick={() => {
                  setSelectedMarketId(market.marketId)
                  setQuantity(0)
                }}
              >
                {market.marketName}
              </PillButton>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {currentMarket?.menus.map((menu) => (
              <ProductCard
                key={menu.menuId}
                product={{
                  id: String(menu.menuId),
                  name: menu.menuName,
                  price: menu.price,
                  image: getMenuImage(menu.menuId),
                }}
                quantity={selectedMenuId === menu.menuId ? quantity : 0}
                onChange={(next) => handleMenuChange(menu, next)}
              />
            ))}
          </div>
          {error ? (
            <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
              {error}
            </p>
          ) : null}
          <PaymentSummary
            amount={totalAmount}
            merchant={currentMarket?.marketName ?? '가맹점을 선택하세요'}
            primaryLabel="구매하기"
            onPrimary={handleBuy}
          />
        </div>
      </Content>
      <BottomNav />
    </AppFrame>
  )
}
