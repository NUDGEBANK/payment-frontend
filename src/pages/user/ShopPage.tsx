import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPaymentSession, fetchCatalog } from '../../api/userApi'
import { useUserApp } from '../../app/providers/UserAppProvider'
import { PaymentSummary, ProductCard } from '../../components/payment'
import { AppFrame, BottomNav, Content, PageHeader, PillButton } from '../../components/ui'
import type { CartItem, CategoryGroup, Merchant } from '../../types/payment'

export function ShopPage() {
  const navigate = useNavigate()
  const { setPendingCart, setActivePayment } = useUserApp()
  const [categories, setCategories] = useState<CategoryGroup[]>([])
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [major, setMajor] = useState('FOOD')
  const [subCategory, setSubCategory] = useState('한식')
  const [merchantId, setMerchantId] = useState('')
  const [cartMap, setCartMap] = useState<Record<string, number>>({})

  useEffect(() => {
    fetchCatalog().then((data) => {
      setCategories(data.categories)
      setMerchants(data.merchants)
      const firstCategory = data.categories[0]
      setMajor(firstCategory.major)
      setSubCategory(firstCategory.subCategories[0])
    })
  }, [])

  const currentCategory = categories.find((item) => item.major === major)
  const subMerchants = useMemo(
    () => merchants.filter((item) => item.majorCategory === major && item.subCategory === subCategory),
    [major, merchants, subCategory],
  )

  useEffect(() => {
    if (currentCategory && !currentCategory.subCategories.includes(subCategory)) {
      setSubCategory(currentCategory.subCategories[0])
    }
  }, [currentCategory, subCategory])

  useEffect(() => {
    if (subMerchants.length > 0) {
      setMerchantId(subMerchants[0].id)
    }
  }, [subMerchants])

  const selectedMerchant = subMerchants.find((item) => item.id === merchantId) ?? subMerchants[0]
  const totalAmount = selectedMerchant
    ? selectedMerchant.products.reduce(
        (sum, product) => sum + (cartMap[product.id] ?? 0) * product.price,
        0,
      )
    : 0

  const handleBuy = async () => {
    if (!selectedMerchant || totalAmount <= 0) {
      return
    }

    const cart: CartItem[] = Object.entries(cartMap)
      .filter(([, quantity]) => quantity > 0)
      .map(([productId, quantity]) => ({ productId, quantity }))

    const session = await createPaymentSession({ merchantId: selectedMerchant.id, cart })
    setPendingCart(cart)
    setActivePayment(session)
    navigate(`/user/payment/qr?paymentId=${session.id}`)
  }

  return (
    <AppFrame>
      <PageHeader title="상품 선택" backTo="/user" />
      <Content>
        <div className="space-y-5">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((item) => (
              <PillButton
                key={item.major}
                active={item.major === major}
                onClick={() => {
                  setMajor(item.major)
                  setSubCategory(item.subCategories[0])
                }}
              >
                {item.label}
              </PillButton>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {currentCategory?.subCategories.map((item) => (
              <PillButton key={item} active={item === subCategory} onClick={() => setSubCategory(item)}>
                {item}
              </PillButton>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {subMerchants.map((item) => (
              <PillButton key={item.id} active={item.id === merchantId} onClick={() => setMerchantId(item.id)}>
                {item.name}
              </PillButton>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {selectedMerchant?.products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                quantity={cartMap[product.id] ?? 0}
                onChange={(next) => setCartMap((current) => ({ ...current, [product.id]: next }))}
              />
            ))}
          </div>
          <PaymentSummary
            amount={totalAmount}
            merchant={selectedMerchant?.name ?? '가맹점을 선택하세요'}
            primaryLabel="구매하기"
            onPrimary={handleBuy}
          />
        </div>
      </Content>
      <BottomNav />
    </AppFrame>
  )
}
