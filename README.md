# Jaejun Park — Academic Website

CV를 바탕으로 만든 대학원생 개인 웹사이트입니다. HTML, CSS, JavaScript로 구성되어 있으며 패키지 설치 없이 GitHub Pages에 배포할 수 있습니다. 학력·연구·발표 등의 내용과 Google Scholar 주소는 제공된 CV에서 가져왔으며, GitHub 주소는 알려주신 `jjpark17` 계정으로 연결했습니다. 소개와 전체 논문 목록은 HTML에 포함되어 검색엔진과 JavaScript를 끈 브라우저에서도 읽을 수 있습니다.

## 로컬에서 보기

흰색 배경·베이지색 상단 바·녹색 포인트·프로필 사이드바와 읽기 편한 산세리프 글꼴을 사용하는 디자인입니다. 이름은 **Jaejun Park**로 표시합니다. 웹사이트와 메뉴는 **Home**, **Publications** 두 개로 구성됩니다. `index.html`에는 연구 관심사를 합친 자기소개 문단과 한 줄 소식 목록인 **News**를, `publications.html`에는 검색·필터가 있는 전체 논문 목록을 제공합니다. 프로필 사진과 논문 대표 이미지 자리가 준비되어 있습니다. 국내 논문에는 Scholar 검색 링크를 표시하지 않습니다.

페이지는 최소 너비 1260px의 데스크톱 배치를 유지합니다. 창이 좁아져도 글꼴·사진·단 구성은 축소하지 않으며, 가로 스크롤로 전체 내용을 볼 수 있습니다.

Node.js가 설치된 환경에서 이 폴더의 PowerShell을 열고 다음 명령을 차례로 실행합니다. `npm install`은 필요하지 않습니다.

```powershell
node scripts/build.mjs
node scripts/serve.mjs
```

브라우저에서 서버가 표시하는 주소를 엽니다. 서버는 `Ctrl+C`로 종료합니다. 완성된 `index.html`을 브라우저로 직접 열어도 됩니다.

## GitHub Pages에 배포

현재 홈페이지는 [jjpark17.github.io](https://jjpark17.github.io/)에 배포되어 있고, 저장소는 [jjpark17/jjpark17.github.io](https://github.com/jjpark17/jjpark17.github.io)입니다. 이 폴더의 `main` 브랜치는 해당 저장소의 `origin/main`에 연결되어 있습니다.

수정 후 아래 명령을 실행하면 GitHub Actions가 Home과 Publications를 자동으로 배포합니다.

```powershell
node scripts/build.mjs
git add .
git commit -m "Update academic website"
git push
```

배포 상태는 저장소의 **Actions → Deploy academic website to GitHub Pages**에서 확인합니다. **Settings → Pages → Source**는 **GitHub Actions**로 설정되어 있습니다. [공식 배포 설정 안내](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

`.github/workflows/pages.yml`은 `node scripts/build.mjs`로 HTML을 생성한 뒤 실제 웹사이트 파일인 `index.html`, `publications.html`, `assets/`, `.nojekyll`만 배포 폴더에 복사합니다. README, 루트의 원본 CV, 생성 스크립트, 로컬 검증 파일은 웹사이트에 배포하지 않습니다. `CNAME` 파일을 추가하면 그 파일도 포함합니다. 브랜치 이름이 `main`이 아니라면 워크플로의 `branches: [main]`을 실제 이름으로 바꿉니다.

자산 주소가 상대 경로여서 개인 홈페이지와 저장소 하위 경로 모두에서 사용할 수 있습니다. 워크플로는 [GitHub의 공식 사용자 정의 워크플로 문서](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)를 기준으로 작성했습니다.

## 내용 수정

| 파일 | 수정할 내용 |
| --- | --- |
| `assets/js/content.js` | 프로필, News, 논문, 논문별 수상 배지 등 CV 기반 내용 |
| `index.template.html` | 페이지 구조와 섹션 구성 |
| `publications.template.html` | 별도 논문 목록 페이지 구조 |
| `assets/css/styles.css` | 홈페이지·논문 목록의 색상, 글꼴, 간격, 모바일 화면 스타일 |
| `assets/images/` | 프로필 사진과 논문 대표 이미지 파일 |
| `assets/js/main.js` | 화면 동작 |
| `assets/Jaejun_Park_CV.pdf` | 방문자가 내려받을 PDF CV |
| `assets/Jaejun_Park_CV.docx` | 원본 형식의 CV |
| `index.html`, `publications.html` | 자동 생성되는 완성 HTML; 직접 수정하면 다음 생성 때 덮어씁니다 |

CV를 갱신한 뒤에는 다운로드 파일과 `content.js`의 내용을 함께 수정하고 `node scripts/build.mjs`를 실행합니다. GitHub Actions에서도 이 명령을 자동으로 실행합니다.

## News 수정

`assets/js/content.js`의 `news` 배열에 연도(`date`)와 짧은 소식(`text`)을 한 항목씩 추가합니다. `publicationId`를 지정하면 해당 논문으로 연결됩니다. 현재 소식은 CV에 있는 2026·2025년 논문과 수상 내역을 바탕으로 작성했고, 알려지지 않은 월은 표시하지 않습니다. 자기소개와 연구 관심사 문단은 `index.template.html`의 `.bio`에서 수정합니다.

## 사진 추가

사진 파일을 `assets/images/`에 넣은 뒤 `assets/js/content.js`에서 프로필의 `image` 또는 해당 논문의 `thumbnail`을 설정합니다. `null`이면 빈 이미지 자리를 유지합니다.

```js
// profile 안의 image
image: { src: "assets/images/profile.jpg", alt: "Portrait of Jaejun Park" }

// 해당 publication 안의 thumbnail
thumbnail: { src: "assets/images/gentouchvr.png", alt: "GenTouchVR system overview" }
```

경로는 `assets/images/` 아래의 실제 파일을 가리켜야 합니다. 설정 후 `node scripts/build.mjs`를 실행하면 홈페이지와 논문 페이지에 반영됩니다. 프로필 사진은 프레임에 맞게 잘리고, 논문 이미지는 전체 그림이 보이도록 표시됩니다.

수정 내용을 `main`에 올리면 자동으로 다시 배포됩니다. 공개 전에는 화면에 표시되는 CV 정보와 다운로드 파일이 최신인지 확인하면 됩니다.
