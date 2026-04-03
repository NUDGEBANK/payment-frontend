# Payment Backend API Specification

`payment-frontend` 연동을 위한 현재 `payment-backend` 기준 API 명세서입니다.

기준 코드:
- `src/main/java/com/nudgebank/paymentbackend`
- 서버 포트: `9999`
- 기본 URL: `http://localhost:9999`

## 1. 공통 사항

### Content-Type
- 요청: `application/json`
- 응답: `application/json`

### 시간/날짜 형식
- `OffsetDateTime`: ISO-8601 문자열
- 예시: `2026-04-02T15:30:00+09:00`
- `LocalDate`: `yyyy-MM-dd`
- 예시: `2026-04-02`

### 공통 에러 응답 형식

```json
{
  "code": "INVALID_INPUT",
  "message": "...",
  "status": 400,
  "timestamp": "2026-04-02T15:30:00+09:00",
  "fieldErrors": [
    {
      "field": "cardNumber",
      "reason": "must not be blank"
    }
  ]
}
```

필드 설명:
- `code`: 에러 코드
- `message`: 에러 메시지
- `status`: HTTP status
- `timestamp`: 서버 에러 발생 시각
- `fieldErrors`: 유효성 검증 실패 상세

주의:
- 프론트는 가능하면 `message`보다 `code`를 기준으로 분기하는 것을 권장합니다.
- 현재 코드상 `INVALID_INPUT`, `INTERNAL_SERVER_ERROR`의 메시지 문자열은 소스 인코딩 이슈로 실제 응답에서 깨져 보일 수 있습니다.

## 2. 카드 API

### 2.1 카드 인증
- `POST /api/card/verify`

설명:
- 카드번호, 유효기간, 비밀번호를 검증합니다.
- 인증 성공 시 이후 조회/결제에 사용할 `cardId`를 반환합니다.

요청 본문:

```json
{
  "cardNumber": "1234-5678-1234-5678",
  "expiredYm": "27/03",
  "password": "1234"
}
```

요청 필드:
- `cardNumber`: 카드 번호, 필수
- `expiredYm`: `MM/YY` 형식, 필수
- `password`: 카드 비밀번호, 필수

성공 응답: `200 OK`

```json
{
  "cardId": 1,
  "verified": true,
  "message": "Card verification succeeded."
}
```

주요 에러:
- `400 CARD_VERIFICATION_FAILED`: 카드번호/유효기간/비밀번호 불일치
- `403 CARD_BLOCKED`: 사용 불가 카드
- `410 CARD_EXPIRED`: 만료 카드
- `400 INVALID_INPUT`: 필수값 누락

### 2.2 카드 잔액 조회
- `GET /api/card/{cardId}/balance`

Path Parameter:
- `cardId`: 카드 ID

성공 응답: `200 OK`

```json
{
  "cardId": 1,
  "accountId": 10,
  "balance": 152300.00
}
```

주요 에러:
- `404 CARD_NOT_FOUND`
- `403 CARD_BLOCKED`
- `410 CARD_EXPIRED`

## 3. 상품/가맹점/메뉴 API

### 3.1 카테고리-가맹점-메뉴 전체 조회
- `GET /api/products/categories-markets-menus`

설명:
- 프론트에서 상품선택 화면 구성용으로 카테고리, 가맹점, 메뉴 목록을 한 번에 가져옵니다.

성공 응답: `200 OK`

```json
{
  "categories": [
    {
      "categoryId": 1,
      "categoryName": "카페",
      "mcc": "5814",
      "markets": [
        {
          "marketId": 101,
          "marketName": "스타 카페",
          "menus": [
            {
              "menuId": 1001,
              "menuName": "아메리카노",
              "price": 4500.00
            }
          ]
        }
      ]
    }
  ]
}
```

응답 필드:
- `categories[].categoryId`: 카테고리 ID
- `categories[].categoryName`: 카테고리명
- `categories[].mcc`: MCC 코드
- `categories[].markets[].marketId`: 가맹점 ID
- `categories[].markets[].marketName`: 가맹점명
- `categories[].markets[].menus[].menuId`: 메뉴 ID
- `categories[].markets[].menus[].menuName`: 메뉴명
- `categories[].markets[].menus[].price`: 메뉴 가격

## 4. QR 결제 API

## 상태값

결제 상태 enum:
- `CREATED`
- `SCANNED`
- `APPROVED`
- `REJECTED`
- `CANCELED`
- `EXPIRED`

상태 전이:
- `CREATED -> SCANNED`
- `SCANNED -> APPROVED`
- `SCANNED -> REJECTED`
- `CREATED/SCANNED -> CANCELED`
- `CREATED/SCANNED -> EXPIRED`

전이 불가 상태에서 요청 시:
- `409 INVALID_PAYMENT_STATUS`

### 4.1 QR 결제 요청 생성
- `POST /api/payments/qr`

설명:
- 프론트에서 결제 예정 정보를 서버에 등록하고 `qrId`를 발급받습니다.

요청 본문:

```json
{
  "cardId": 1,
  "marketId": 101,
  "paymentAmount": 4500.00,
  "requestedAt": "2026-04-02T15:30:00+09:00",
  "menuName": "아메리카노",
  "quantity": 1
}
```

요청 필드:
- `cardId`: 인증된 카드 ID, 필수
- `marketId`: 가맹점 ID, 필수
- `paymentAmount`: 결제 금액, 필수
- `requestedAt`: 결제 요청 시각, 필수
- `menuName`: 메뉴명, 필수
- `quantity`: 수량, 필수, 최소 1

성공 응답: `200 OK`

```json
{
  "qrId": "8df31f62-f4d8-4afb-a841-0b5d7d082c53",
  "status": "CREATED"
}
```

주요 에러:
- `404 CARD_NOT_FOUND`
- `404 MARKET_NOT_FOUND`
- `403 CARD_BLOCKED`
- `410 CARD_EXPIRED`
- `400 INVALID_INPUT`

### 4.2 QR 결제 상세 조회
- `GET /api/payments/qr/{qrId}`

Path Parameter:
- `qrId`: QR 결제 요청 ID

성공 응답: `200 OK`

```json
{
  "qrId": "8df31f62-f4d8-4afb-a841-0b5d7d082c53",
  "cardId": 1,
  "marketId": 101,
  "marketName": "스타 카페",
  "paymentAmount": 4500.00,
  "requestedAt": "2026-04-02T15:30:00+09:00",
  "status": "CREATED",
  "menuName": "아메리카노",
  "quantity": 1
}
```

주요 에러:
- `404 PAYMENT_NOT_FOUND`

### 4.3 QR 스캔 처리
- `POST /api/payments/qr/{qrId}/scan`

설명:
- QR이 스캔되었음을 표시합니다.
- 현재 상태가 `CREATED`여야 합니다.

성공 응답: `200 OK`

```json
{
  "qrId": "8df31f62-f4d8-4afb-a841-0b5d7d082c53",
  "cardId": 1,
  "marketId": 101,
  "marketName": "스타 카페",
  "paymentAmount": 4500.00,
  "requestedAt": "2026-04-02T15:30:00+09:00",
  "status": "SCANNED",
  "menuName": "아메리카노",
  "quantity": 1
}
```

주요 에러:
- `404 PAYMENT_NOT_FOUND`
- `409 INVALID_PAYMENT_STATUS`
- `410 PAYMENT_EXPIRED`

### 4.4 결제 승인
- `POST /api/payments/qr/{qrId}/approve`

설명:
- 결제를 승인하고 계좌 잔액을 차감합니다.
- 현재 상태가 `SCANNED`여야 합니다.

성공 응답: `200 OK`

```json
{
  "qrId": "8df31f62-f4d8-4afb-a841-0b5d7d082c53",
  "status": "APPROVED",
  "changedAt": "2026-04-02T15:31:10+09:00",
  "message": "Payment approved."
}
```

주요 에러:
- `404 PAYMENT_NOT_FOUND`
- `409 INVALID_PAYMENT_STATUS`
- `400 INSUFFICIENT_BALANCE`
- `403 CARD_BLOCKED`
- `410 CARD_EXPIRED`
- `410 PAYMENT_EXPIRED`

### 4.5 결제 거절
- `POST /api/payments/qr/{qrId}/reject`

설명:
- 현재 상태가 `SCANNED`여야 합니다.

성공 응답: `200 OK`

```json
{
  "qrId": "8df31f62-f4d8-4afb-a841-0b5d7d082c53",
  "status": "REJECTED",
  "changedAt": "2026-04-02T15:31:10+09:00",
  "message": "Payment rejected."
}
```

주요 에러:
- `404 PAYMENT_NOT_FOUND`
- `409 INVALID_PAYMENT_STATUS`
- `410 PAYMENT_EXPIRED`

### 4.6 결제 취소
- `POST /api/payments/qr/{qrId}/cancel`

설명:
- 현재 상태가 `CREATED` 또는 `SCANNED`일 때만 취소 가능합니다.

성공 응답: `200 OK`

```json
{
  "qrId": "8df31f62-f4d8-4afb-a841-0b5d7d082c53",
  "status": "CANCELED",
  "changedAt": "2026-04-02T15:31:10+09:00",
  "message": "Payment canceled."
}
```

주요 에러:
- `404 PAYMENT_NOT_FOUND`
- `409 INVALID_PAYMENT_STATUS`

### 4.7 결제 만료 처리
- `POST /api/payments/qr/{qrId}/expire`

설명:
- 현재 상태가 `CREATED` 또는 `SCANNED`일 때만 만료 가능합니다.

성공 응답: `200 OK`

```json
{
  "qrId": "8df31f62-f4d8-4afb-a841-0b5d7d082c53",
  "status": "EXPIRED",
  "changedAt": "2026-04-02T15:33:00+09:00",
  "message": "Payment expired."
}
```

주요 에러:
- `404 PAYMENT_NOT_FOUND`
- `409 INVALID_PAYMENT_STATUS`

## 5. 카드 이용내역 API

## 기간 타입

`periodType` 가능한 값:
- `ONE_MONTH`
- `THREE_MONTHS`
- `SIX_MONTHS`
- `ONE_YEAR`
- `CUSTOM`

### 5.1 카드 이용 요약 조회
- `GET /api/cards/{cardId}/history/summary`

Path Parameter:
- `cardId`: 카드 ID

성공 응답: `200 OK`

```json
{
  "cardId": 1,
  "currentBalance": 152300.00,
  "currentMonthSpending": 12500.00,
  "previousMonthSpending": 9800.00,
  "changeRatePercent": 27.55
}
```

응답 필드 설명:
- `currentBalance`: 현재 계좌 잔액
- `currentMonthSpending`: 이번 달 승인 결제 합계
- `previousMonthSpending`: 지난 달 승인 결제 합계
- `changeRatePercent`: 전월 대비 증감률(%)

주의:
- 지난 달 사용 금액이 `0`이고 이번 달 사용 금액도 `0`이면 `0`
- 지난 달 사용 금액이 `0`인데 이번 달 사용 금액이 있으면 `null`

주요 에러:
- `404 CARD_NOT_FOUND`

### 5.2 카드 거래내역 조회
- `GET /api/cards/{cardId}/history/transactions`

Query Parameters:
- `periodType`: 필수
- `startDate`: 선택, `CUSTOM`일 때 필수, 형식 `yyyy-MM-dd`
- `endDate`: 선택, `CUSTOM`일 때 필수, 형식 `yyyy-MM-dd`

요청 예시:
- `GET /api/cards/1/history/transactions?periodType=ONE_MONTH`
- `GET /api/cards/1/history/transactions?periodType=CUSTOM&startDate=2026-03-01&endDate=2026-03-31`

성공 응답: `200 OK`

```json
{
  "cardId": 1,
  "periodType": "CUSTOM",
  "startDate": "2026-03-01",
  "endDate": "2026-03-31",
  "count": 2,
  "transactions": [
    {
      "transactionId": 100,
      "qrId": "8df31f62-f4d8-4afb-a841-0b5d7d082c53",
      "marketId": 101,
      "marketName": "스타 카페",
      "categoryId": 1,
      "categoryName": "카페",
      "amount": 4500.00,
      "transactionDatetime": "2026-03-18T09:10:00+09:00",
      "menuName": "아메리카노",
      "quantity": 1
    }
  ]
}
```

응답 필드 설명:
- `count`: 거래 건수
- `transactions[]`: 승인 완료된 결제 내역 목록

주요 에러:
- `404 CARD_NOT_FOUND`
- `400 INVALID_INPUT`: `periodType` 누락/형식 오류
- `400 INVALID_HISTORY_DATE_RANGE`: `CUSTOM`인데 날짜 누락, 또는 `startDate > endDate`

## 6. 프론트 연동 권장 흐름

### 카드 인증 후 결제 생성
1. `POST /api/card/verify`
2. 응답의 `cardId` 저장
3. `GET /api/products/categories-markets-menus` 로 가맹점/메뉴 목록 조회
4. 메뉴 선택 후 `POST /api/payments/qr`
5. QR 화면 또는 결제 상태 화면에서 `GET /api/payments/qr/{qrId}` 조회

### QR 결제 상태 처리
1. QR 인식 시 `POST /api/payments/qr/{qrId}/scan`
2. 사용자 승인 시 `POST /api/payments/qr/{qrId}/approve`
3. 사용자 거절 시 `POST /api/payments/qr/{qrId}/reject`
4. 사용자 이탈/취소 시 `POST /api/payments/qr/{qrId}/cancel`
5. 타임아웃 처리 시 `POST /api/payments/qr/{qrId}/expire`

## 7. 구현 기준 주의사항

- 현재 인증/인가 토큰 체계는 없습니다. 카드 인증 성공 후 받은 `cardId`를 그대로 후속 API에 사용합니다.
- `GET /api/card/{cardId}/balance` 경로는 단수형 `card`입니다.
- 거래내역 경로는 복수형 `cards`입니다.
- QR 만료 시간은 생성 시점 기준 `3분`으로 설계되어 있습니다.
- 다만 현재 구현에서는 자동 만료 스케줄러가 없고, 상태가 실제 `EXPIRED`로 바뀌려면 `POST /api/payments/qr/{qrId}/expire` 호출이 필요합니다.
- 승인 성공 시 잔액 차감과 거래내역 저장이 함께 처리됩니다.
- `scan`과 `approve/reject`는 본문 없이 호출합니다.

## 8. 참고

- 프로젝트에는 `springdoc-openapi` 의존성이 포함되어 있어 서버 실행 시 Swagger UI/OpenAPI가 노출될 수 있습니다.
- 다만 프론트 연동 기준으로는 이 문서를 우선 사용하고, 실제 응답은 백엔드 실행 후 Swagger와 함께 한번 더 검증하는 것이 안전합니다.
