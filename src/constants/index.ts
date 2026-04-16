export const MESSAGES = {
  ONBOARDING_TITLE: '북덕살롱 독서위젯',
  ONBOARDING_SUBTITLE_LINE1: '카카오 도서 검색으로',
  ONBOARDING_SUBTITLE_LINE2: '간편하게 책을 추가하세요',
  ONBOARDING_CTA: '노션 연결하기',
  ONBOARDING_TRUST: '연결은 언제든 해제할 수 있어요',

  DB_SELECT_TITLE: '어디에 책을 추가할까요?',
  DB_SELECT_SUBTITLE: '연결된 노션 데이터베이스 중 하나를 선택하세요',
  DB_SELECT_CONFIRM: '선택 완료',
  DB_SELECT_EMPTY: '접근 가능한 데이터베이스가 없어요',
  DB_SELECT_EMPTY_GUIDE: '노션에서 이 integration에 데이터베이스 접근 권한을 추가해주세요',

  SEARCH_PLACEHOLDER: '책 제목, 저자, ISBN으로 검색',
  SEARCH_EMPTY: '검색 결과가 없어요',
  SEARCH_INITIAL: '책을 검색해보세요',
  LOAD_MORE: '더 보기',

  ADD: '추가',
  ADDED: '추가됨',

  TOKEN_EXPIRED: '노션 연결이 만료됐어요',
  TOKEN_EXPIRED_ACTION: '다시 연결',
  API_ERROR: '검색 서비스에 문제가 생겼어요. 잠시 후 다시 시도해주세요',
  API_ERROR_ACTION: '다시 시도',
  ADDED_SUCCESS: '추가됐어요',
} as const

export const WIDGET_USER_ID_KEY = 'notion_book_widget_user_id'
export const SEARCH_DEBOUNCE_MS = 300
export const SEARCH_PAGE_SIZE = 10
export const BANNER_AUTO_DISMISS_MS = 3000
