# 짝 프로그래밍 선언문

우아한테크코스 8기 크루들이 함께 만든 짝 프로그래밍 선언문입니다.

**웹 페이지:** https://woowacourse.github.io/pair-programming-manifesto/

---

## 이 저장소의 목적

짝 프로그래밍을 하면서 우리가 함께 지키고 싶은 원칙들을 [`principles.md`](./principles.md)로 관리합니다.
원칙은 고정된 것이 아닙니다. 크루들이 동의한다면 언제든 바꿀 수 있어요.

---

## 원칙을 수정하거나 추가하고 싶다면

### GitHub 웹에서 바로 수정하기 (가장 쉬운 방법)

1. [`principles.md`](./principles.md) 파일을 열고 연필 아이콘(Edit this file)을 클릭
2. 내용을 수정한 뒤 **Propose changes** 클릭
3. Pull Request를 생성하면 크루들이 확인 후 머지합니다

### 로컬에서 작업하기

```bash
git clone https://github.com/woowacourse/pair-programming-manifesto.git
cd pair-programming-manifesto
# principles.md 수정 후
git checkout -b fix/update-principles
git commit -m "docs: 원칙 수정 내용 설명"
git push origin fix/update-principles
# GitHub에서 Pull Request 생성
```

---

## 원칙 파일 형식

[`principles.md`](./principles.md)는 아래 형식을 따릅니다.

```markdown
# 짝 프로그래밍 선언문

부제목 첫 번째 줄
부제목 두 번째 줄

1. 원칙 하나
2. 원칙 둘

> * 푸터 문장

---

닉네임1 닉네임2 닉네임3
```

| 요소 | 형식 | 설명 |
|------|------|------|
| 제목 | `# H1` | 선언문 제목 |
| 부제목 | 일반 텍스트 | 줄바꿈 보존됨 |
| 원칙 | `1.` 번호 목록 | 번호는 자동 처리 |
| 푸터 | `> *` blockquote | 하단 안내 문구 |
| 크레딧 | `---` 아래 공백 구분 닉네임 | 기여자 목록 |

---

## 웹 페이지 개발에 기여하고 싶다면

```bash
pnpm install
pnpm dev       # http://localhost:3000/pair-programming-manifesto/
pnpm test      # 테스트 실행
pnpm build     # 정적 빌드
```

이슈를 먼저 등록하고 PR을 올려주세요.
`main` 브랜치에 머지되면 GitHub Actions가 자동으로 배포합니다.
