# Jaejun Park — Academic Website

CV를 바탕으로 만든 대학원생 개인 웹사이트입니다. HTML, CSS, JavaScript로 구성되어 있으며 패키지 설치 없이 GitHub Pages에 배포할 수 있습니다. 학력·연구·발표 등의 내용과 Google Scholar 주소는 제공된 CV에서 가져왔으며, GitHub 주소는 알려주신 `jjpark17` 계정으로 연결했습니다. 소개와 전체 논문 목록은 HTML에 포함되어 검색엔진과 JavaScript를 끈 브라우저에서도 읽을 수 있습니다.

## 로컬에서 보기

Node.js가 설치된 환경에서 이 폴더의 PowerShell을 열고 다음 명령을 차례로 실행합니다. `npm install`은 필요하지 않습니다.

```powershell
node scripts/build.mjs
node scripts/serve.mjs
```

브라우저에서 서버가 표시하는 주소를 엽니다. 서버는 `Ctrl+C`로 종료합니다. 완성된 `index.html`을 브라우저로 직접 열어도 됩니다.

## GitHub Pages에 배포

1. [jjpark17 계정](https://github.com/jjpark17)에서 이름이 `jjpark17.github.io`인 공개 저장소를 만듭니다. 배포 후 개인 홈페이지 주소는 [https://jjpark17.github.io](https://jjpark17.github.io)입니다. 일반 저장소 `homepage`를 사용하면 주소는 `https://jjpark17.github.io/homepage/`입니다. [GitHub Pages 주소 안내](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
2. 이 폴더의 웹사이트 파일을 저장소의 루트에 올립니다. 숨김 항목인 `.github` 폴더와 `.nojekyll`, `.gitignore`, 생성에 필요한 `scripts/`와 `index.template.html`도 포함하고, 기본 브랜치는 `main`으로 설정합니다. 루트의 원본 CV 대신 `assets/`의 CV 파일을 포함합니다.
3. 저장소의 **Settings → Pages → Build and deployment → Source**에서 **GitHub Actions**를 선택합니다. [공식 배포 설정 안내](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
4. **Actions → Deploy academic website to GitHub Pages → Run workflow**를 실행하거나 `main`에 변경 사항을 올립니다. 배포가 성공하면 **Settings → Pages**에 표시된 주소를 엽니다.

`.github/workflows/pages.yml`은 `node scripts/build.mjs`로 HTML을 생성한 뒤 실제 웹사이트 파일인 `index.html`, `assets/`, `.nojekyll`만 배포 폴더에 복사합니다. README, 루트의 원본 CV, 생성 스크립트, 로컬 검증 파일은 웹사이트에 배포하지 않습니다. `CNAME` 파일을 추가하면 그 파일도 포함합니다. 브랜치 이름이 `main`이 아니라면 워크플로의 `branches: [main]`을 실제 이름으로 바꿉니다.

자산 주소가 상대 경로여서 개인 홈페이지와 저장소 하위 경로 모두에서 사용할 수 있습니다. 워크플로는 [GitHub의 공식 사용자 정의 워크플로 문서](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)를 기준으로 작성했습니다.

## 내용 수정

| 파일 | 수정할 내용 |
| --- | --- |
| `assets/js/content.js` | 소개, 학력, 연구 활동, 발표, 수상 등 CV 기반 내용 |
| `index.template.html` | 페이지 구조와 섹션 구성 |
| `assets/css/styles.css` | 색상, 글꼴, 간격, 모바일 화면 스타일 |
| `assets/js/main.js` | 화면 동작 |
| `assets/Jaejun_Park_CV.pdf` | 방문자가 내려받을 PDF CV |
| `assets/Jaejun_Park_CV.docx` | 원본 형식의 CV |
| `index.html` | 자동 생성되는 완성 HTML; 직접 수정하면 다음 생성 때 덮어씁니다 |

CV를 갱신한 뒤에는 다운로드 파일과 `content.js`의 내용을 함께 수정하고 `node scripts/build.mjs`를 실행합니다. GitHub Actions에서도 이 명령을 자동으로 실행합니다. 프로필 사진이나 외부 프로필 주소는 실제 자료를 확보한 후 추가합니다.

수정 내용을 `main`에 올리면 자동으로 다시 배포됩니다. 공개 전에는 화면에 표시되는 CV 정보와 다운로드 파일이 최신인지 확인하면 됩니다.
