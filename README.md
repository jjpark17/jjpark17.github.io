# Jaejun Park — Academic Website

CV를 바탕으로 만든 대학원생 개인 웹사이트입니다. HTML, CSS, JavaScript로 구성되어 있으며 패키지 설치 없이 GitHub Pages에 배포할 수 있습니다. 학력·연구·발표 등의 내용과 Google Scholar 주소는 제공된 CV에서 가져왔으며, GitHub 주소는 알려주신 `jjpark17` 계정으로 연결했습니다. 소개와 전체 논문 목록은 HTML에 포함되어 검색엔진과 JavaScript를 끈 브라우저에서도 읽을 수 있습니다.

## 로컬에서 보기

기본 홈페이지는 **Studio**의 간결한 본문과 **Classic**의 프로필 사이드바·세리프 제목을 섞은 디자인입니다. 이름은 **Jaejun Park**로 표시합니다. 파스텔 포인트의 **Playful** 디자인은 `playful.html`, 첫 **Classic** 디자인은 `classic.html`에서 비교할 수 있습니다. 세 페이지 모두 프로필·연구 관심사·전체 논문 목록으로 구성되며, 국내 논문에는 Scholar 검색 링크를 표시하지 않습니다.

Node.js가 설치된 환경에서 이 폴더의 PowerShell을 열고 다음 명령을 차례로 실행합니다. `npm install`은 필요하지 않습니다.

```powershell
node scripts/build.mjs
node scripts/serve.mjs
```

브라우저에서 서버가 표시하는 주소를 엽니다. 서버는 `Ctrl+C`로 종료합니다. 완성된 `index.html`을 브라우저로 직접 열어도 됩니다.

## GitHub Pages에 배포

현재 홈페이지는 [jjpark17.github.io](https://jjpark17.github.io/)에 배포되어 있고, 저장소는 [jjpark17/jjpark17.github.io](https://github.com/jjpark17/jjpark17.github.io)입니다. 이 폴더의 `main` 브랜치는 해당 저장소의 `origin/main`에 연결되어 있습니다.

수정 후 아래 명령을 실행하면 GitHub Actions가 세 디자인을 자동으로 배포합니다.

```powershell
node scripts/build.mjs
git add .
git commit -m "Update academic website"
git push
```

배포 상태는 저장소의 **Actions → Deploy academic website to GitHub Pages**에서 확인합니다. **Settings → Pages → Source**는 **GitHub Actions**로 설정되어 있습니다. [공식 배포 설정 안내](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

`.github/workflows/pages.yml`은 `node scripts/build.mjs`로 HTML을 생성한 뒤 실제 웹사이트 파일인 `index.html`, `classic.html`, `playful.html`, `assets/`, `.nojekyll`만 배포 폴더에 복사합니다. README, 루트의 원본 CV, 생성 스크립트, 로컬 검증 파일은 웹사이트에 배포하지 않습니다. `CNAME` 파일을 추가하면 그 파일도 포함합니다. 브랜치 이름이 `main`이 아니라면 워크플로의 `branches: [main]`을 실제 이름으로 바꿉니다.

자산 주소가 상대 경로여서 개인 홈페이지와 저장소 하위 경로 모두에서 사용할 수 있습니다. 워크플로는 [GitHub의 공식 사용자 정의 워크플로 문서](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)를 기준으로 작성했습니다.

## 내용 수정

| 파일 | 수정할 내용 |
| --- | --- |
| `assets/js/content.js` | 프로필, 연구 관심사, 논문, 논문별 수상 배지 등 CV 기반 내용 |
| `index.template.html` | 페이지 구조와 섹션 구성 |
| `classic.template.html` | 기존 디자인 페이지 구조 |
| `playful.template.html` | 파스텔 디자인 페이지 구조 |
| `assets/css/styles.css` | 색상, 글꼴, 간격, 모바일 화면 스타일 |
| `assets/css/classic.css` | 기존 디자인 스타일 |
| `assets/css/playful.css` | 파스텔 디자인 스타일 |
| `assets/js/main.js` | 화면 동작 |
| `assets/Jaejun_Park_CV.pdf` | 방문자가 내려받을 PDF CV |
| `assets/Jaejun_Park_CV.docx` | 원본 형식의 CV |
| `index.html`, `classic.html`, `playful.html` | 자동 생성되는 완성 HTML; 직접 수정하면 다음 생성 때 덮어씁니다 |

CV를 갱신한 뒤에는 다운로드 파일과 `content.js`의 내용을 함께 수정하고 `node scripts/build.mjs`를 실행합니다. GitHub Actions에서도 이 명령을 자동으로 실행합니다. 프로필 사진이나 외부 프로필 주소는 실제 자료를 확보한 후 추가합니다.

수정 내용을 `main`에 올리면 자동으로 다시 배포됩니다. 공개 전에는 화면에 표시되는 CV 정보와 다운로드 파일이 최신인지 확인하면 됩니다.
