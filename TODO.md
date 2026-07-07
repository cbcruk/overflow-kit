# Overflow Kit - Future Tasks

## High Priority

### React Integration
- [x] `overflow-kit/react` 서브패키지 생성
- [x] `useOverflow` 훅 구현 (generator 기반)
- [x] `useCanvasOverflow` 훅 구현 (canvas 기반)
- [ ] `<OverflowContainer>` 컴포넌트 구현

### Testing
- [x] core 패키지 유닛 테스트 추가
- [x] react 훅 통합 테스트 추가 (happy-dom)
- [ ] canvas 패키지 유닛 테스트 추가
- [ ] generator 패키지 유닛 테스트 추가
- [ ] E2E 테스트 (Playwright) 추가

### Documentation
- [x] README.md 작성 (설치, 사용법, API)
- [x] React 훅 사용법 문서화
- [ ] JSDoc 주석 보강
- [x] 예제 코드 추가 (데모를 훅 기반으로 전환)

### CI/CD
- [x] CI 파이프라인 추가 (lint, format, build, test)

## Medium Priority

### Canvas Package Improvements
- [ ] Canvas에도 auto mode 추가 (itemClassName 옵션)
- [ ] 폰트 로딩 대기 로직 추가 (document.fonts.ready)
- [ ] 캐싱 전략 개선 (LRU cache)

### Generator Package Improvements
- [ ] 측정 성능 최적화 (batch DOM read)
- [ ] MutationObserver로 아이템 변경 감지
- [ ] 측정 결과 캐싱

### Features
- [ ] 수직 오버플로우 지원 (vertical mode)
- [ ] 양방향 오버플로우 (bidirectional)
- [ ] 커스텀 rest indicator 컴포넌트 지원
- [ ] 애니메이션/트랜지션 지원

## Low Priority

### Framework Support
- [ ] Vue 어댑터 (`@overflow-kit/vue`)
- [ ] Svelte 어댑터 (`@overflow-kit/svelte`)
- [ ] Vanilla JS 헬퍼 함수

### Developer Experience
- [ ] Storybook 설정
- [ ] Changeset 설정 (버전 관리)
- [ ] NPM 퍼블리싱 설정
- [ ] CI/CD 파이프라인 강화 (lint, test, build)

### Performance
- [ ] 번들 사이즈 최적화
- [ ] Tree-shaking 검증
- [ ] 벤치마크 테스트 추가

### Accessibility
- [ ] 숨겨진 아이템에 대한 스크린 리더 지원
- [ ] 키보드 네비게이션 가이드
- [ ] ARIA 속성 권장사항 문서화

## Ideas (검토 필요)

- [ ] SSR 지원 방안 검토
- [ ] Web Worker에서 측정 수행
- [ ] IntersectionObserver 활용 방안
- [ ] 가상 스크롤과의 통합
