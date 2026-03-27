import type {
  CategoryGroup,
  Merchant,
  MockDatabase,
  TransactionItem,
} from '../types/payment'

const createMockImage = (title: string, toneA: string, toneB: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 420">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${toneA}" />
          <stop offset="100%" stop-color="${toneB}" />
        </linearGradient>
      </defs>
      <rect width="600" height="420" rx="36" fill="url(#g)" />
      <circle cx="480" cy="88" r="74" fill="rgba(255,255,255,0.14)" />
      <circle cx="104" cy="348" r="96" fill="rgba(255,255,255,0.10)" />
      <text x="48" y="318" fill="white" font-size="44" font-family="Pretendard, Arial, sans-serif" font-weight="700">${title}</text>
    </svg>
  `)}`

const plate = createMockImage('Premium Dining', '#8b5cf6', '#1d4ed8')
const burger = createMockImage('Deli Burger', '#f97316', '#b91c1c')
const bibimbap = createMockImage('Bibimbap', '#a16207', '#57534e')
const salad = createMockImage('Season Salad', '#10b981', '#0f766e')
const train = createMockImage('Transit Pass', '#0ea5e9', '#2563eb')
const taxi = createMockImage('Blue Taxi', '#334155', '#0f172a')
const hotel = createMockImage('Hotel Stay', '#7c3aed', '#4338ca')
const movie = createMockImage('Cinema', '#ec4899', '#7c2d12')
const mart = createMockImage('Daily Mart', '#06b6d4', '#2563eb')
const beauty = createMockImage('Beauty Set', '#f43f5e', '#db2777')

export const categoryGroups: CategoryGroup[] = [
  { major: 'FOOD', label: '식사', subCategories: ['한식', '패스트푸드'] },
  { major: 'TRANSIT', label: '교통', subCategories: ['대중교통', '택시'] },
  { major: 'LEISURE', label: '여가', subCategories: ['숙박', '영화'] },
  { major: 'RETAIL', label: '유통', subCategories: ['마트', '뷰티'] },
]

export const merchants: Merchant[] = [
  {
    id: 'merchant-food-1',
    name: '프리미엄 다이닝',
    majorCategory: 'FOOD',
    subCategory: '한식',
    products: [
      { id: 'p1', name: '프리미엄 정식', price: 15000, image: plate },
      { id: 'p2', name: '전통 비빔밥', price: 12000, image: bibimbap },
      { id: 'p3', name: '시즈널 샐러드', price: 9000, image: salad },
    ],
  },
  {
    id: 'merchant-food-2',
    name: '델리 버거랩',
    majorCategory: 'FOOD',
    subCategory: '패스트푸드',
    products: [
      { id: 'p4', name: '델리 샌드위치', price: 8500, image: burger },
      { id: 'p5', name: '치즈 버거 세트', price: 11000, image: burger },
    ],
  },
  {
    id: 'merchant-transit-1',
    name: '서울 대중교통',
    majorCategory: 'TRANSIT',
    subCategory: '대중교통',
    products: [
      { id: 'p6', name: '지하철 1회권', price: 1450, image: train },
      { id: 'p7', name: '공항철도 직통', price: 9500, image: train },
    ],
  },
  {
    id: 'merchant-transit-2',
    name: '블루택시',
    majorCategory: 'TRANSIT',
    subCategory: '택시',
    products: [
      { id: 'p8', name: '기본 택시 요금', price: 4800, image: taxi },
      { id: 'p9', name: '프리미엄 택시', price: 12000, image: taxi },
    ],
  },
  {
    id: 'merchant-leisure-1',
    name: '루프탑 호텔',
    majorCategory: 'LEISURE',
    subCategory: '숙박',
    products: [
      { id: 'p10', name: '디럭스 1박', price: 159000, image: hotel },
      { id: 'p11', name: '브런치 패키지', price: 49000, image: hotel },
    ],
  },
  {
    id: 'merchant-leisure-2',
    name: '시네마 포레스트',
    majorCategory: 'LEISURE',
    subCategory: '영화',
    products: [
      { id: 'p12', name: '프리미엄 관람권', price: 18000, image: movie },
      { id: 'p13', name: '커플 패키지', price: 32000, image: movie },
    ],
  },
  {
    id: 'merchant-retail-1',
    name: '데일리 마트',
    majorCategory: 'RETAIL',
    subCategory: '마트',
    products: [
      { id: 'p14', name: '장보기 1만원권', price: 10000, image: mart },
      { id: 'p15', name: '장보기 3만원권', price: 30000, image: mart },
    ],
  },
  {
    id: 'merchant-retail-2',
    name: '글로우 뷰티',
    majorCategory: 'RETAIL',
    subCategory: '뷰티',
    products: [
      { id: 'p16', name: '스킨케어 세트', price: 45000, image: beauty },
      { id: 'p17', name: '뷰티 기프트 박스', price: 69000, image: beauty },
    ],
  },
]

export const initialTransactions: TransactionItem[] = [
  {
    id: 'tx-1',
    merchant: '스타벅스 강남점',
    category: '카페',
    amount: -5500,
    type: 'PAYMENT',
    approvedAt: '2026-03-21T14:30:00+09:00',
  },
  {
    id: 'tx-2',
    merchant: '무신사 테라스',
    category: '패션',
    amount: -89000,
    type: 'PAYMENT',
    approvedAt: '2026-03-21T12:15:00+09:00',
  },
  {
    id: 'tx-3',
    merchant: '대중교통',
    category: '교통',
    amount: -1250,
    type: 'PAYMENT',
    approvedAt: '2026-03-20T08:45:00+09:00',
  },
  {
    id: 'tx-4',
    merchant: '입금: 홍길동',
    category: '충전',
    amount: 35000,
    type: 'CHARGE',
    approvedAt: '2026-03-20T11:20:00+09:00',
  },
]

export const defaultDatabase: MockDatabase = {
  card: null,
  transactions: initialTransactions,
  merchants,
  categories: categoryGroups,
  paymentSessions: [],
}
