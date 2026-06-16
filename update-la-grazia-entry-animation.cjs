/**
 * La Grazia Italian Boutique Entry Animation Updater
 *
 * How to use:
 * 1) Put this file in the ROOT of your Vite project, beside package.json.
 * 2) Run: node update-la-grazia-entry-animation.cjs
 * 3) Run: npm run build
 * 4) Run: npm run dev
 *
 * It edits src/App.tsx safely and creates:
 * src/App.backup-before-italian-entry.tsx
 */

const fs = require("fs");
const path = require("path");

const appPath = path.join(process.cwd(), "src", "App.tsx");
const backupPath = path.join(process.cwd(), "src", "App.backup-before-italian-entry.tsx");

if (!fs.existsSync(appPath)) {
  console.error("❌ Could not find src/App.tsx. Put this file in the project root beside package.json.");
  process.exit(1);
}

let appCode = fs.readFileSync(appPath, "utf8");

if (!fs.existsSync(backupPath)) {
  fs.writeFileSync(backupPath, appCode, "utf8");
  console.log("✅ Backup created: src/App.backup-before-italian-entry.tsx");
} else {
  console.log("ℹ️ Backup already exists. I will not overwrite it.");
}

const oldAppCode = appCode;

// Make the loading state match the new cinematic animation timing.
appCode = appCode.replace(
  /window\.setTimeout\(\(\)\s*=>\s*setLoading\(false\),\s*\d+\)/,
  "window.setTimeout(() => setLoading(false), 5800)"
);

// Replace the old simple loader JSX with the Italian boutique scene.
const newLoaderJsx = String.raw`{loading && (
        <div className="loader" aria-label="Opening La Grazia boutique">
          <div className="italySky" />
          <div className="italySun" />

          <div className="italianStreet">
            <span className="streetLine streetLineOne" />
            <span className="streetLine streetLineTwo" />
            <span className="streetLine streetLineThree" />
          </div>

          <div className="storeScene">
            <div className="storeAwning">
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>

            <div className="storeFacade">
              <div className="storeSign">
                <small>Milano Atelier</small>
                <h1>LA GRAZIA</h1>
              </div>

              <div className="boutiqueWindow boutiqueWindowLeft">
                <div className="windowShine" />
                <div className="displayPedestal" />
                <div className="displayDress" />
              </div>

              <div className="storeDoorWrap">
                <div className="doorGlow" />
                <div className="doorPanel doorPanelLeft">
                  <span className="doorHandle" />
                </div>
                <div className="doorPanel doorPanelRight">
                  <span className="doorHandle" />
                </div>
              </div>

              <div className="boutiqueWindow boutiqueWindowRight">
                <div className="windowShine" />
                <div className="displayPedestal" />
                <div className="displayScarf" />
              </div>
            </div>

            <div className="storeSteps">
              <span />
              <span />
            </div>
          </div>

          <div className="loaderInner">
            <p className="loaderKicker">{isArabic ? "مرحباً بكِ في إيطاليا" : "Benvenuta in Italia"}</p>
            <h1>LA GRAZIA</h1>
            <p>{isArabic ? "أبواب الأتيليه تُفتح الآن" : "The atelier doors are opening"}</p>
            <div className="loaderLine" />
          </div>

          <div className="enterGlow" />
        </div>
      )}`;

const loaderJsxPattern = /\{loading && \(\s*<div className="loader">[\s\S]*?<div className="loaderLine" \/>\s*<\/div>\s*<\/div>\s*\)\}/;

if (!loaderJsxPattern.test(appCode)) {
  console.error("❌ Could not find the old loader JSX block. Maybe it was already changed.");
  process.exit(1);
}

appCode = appCode.replace(loaderJsxPattern, newLoaderJsx);

// Replace the old loader CSS block with the cinematic Italian boutique CSS.
const newLoaderCss = String.raw`
        .loader {
          position: fixed;
          inset: 0;
          z-index: 200;
          overflow: hidden;
          background:
            radial-gradient(circle at 50% 28%, rgba(247, 241, 232, 0.5), transparent 28%),
            linear-gradient(180deg, #efe3cf 0%, #d6b98e 44%, #7a5940 100%);
          color: #fff9f0;
          animation: loaderOut 0.95s ease 4.95s forwards;
          perspective: 1400px;
        }

        .loader::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 8;
          pointer-events: none;
          background:
            radial-gradient(circle at center, transparent 34%, rgba(44, 31, 24, 0.28) 100%),
            linear-gradient(90deg, rgba(44, 31, 24, 0.22), transparent 22%, transparent 78%, rgba(44, 31, 24, 0.22));
          opacity: 0.72;
        }

        .loader::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 20;
          pointer-events: none;
          background: #fff9f0;
          opacity: 0;
          animation: boutiqueFlash 0.9s ease 4.42s forwards;
        }

        .italySky {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, rgba(255, 249, 240, 0.72), rgba(233, 204, 162, 0.26) 48%, rgba(44, 31, 24, 0.2)),
            radial-gradient(circle at 22% 22%, rgba(255, 249, 240, 0.8), transparent 18%);
          animation: skyBreathe 4.8s ease-in-out both;
        }

        .italySun {
          position: absolute;
          right: 15%;
          top: 14%;
          width: clamp(80px, 12vw, 160px);
          height: clamp(80px, 12vw, 160px);
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 244, 213, 0.92), rgba(215, 180, 111, 0.2) 62%, transparent 70%);
          filter: blur(1px);
          opacity: 0.8;
          animation: sunGlow 3.8s ease-in-out infinite alternate;
        }

        .italianStreet {
          position: absolute;
          left: 50%;
          bottom: -8%;
          width: 120vw;
          height: 42vh;
          transform: translateX(-50%) rotateX(64deg);
          transform-origin: center bottom;
          background:
            repeating-linear-gradient(90deg, rgba(255, 249, 240, 0.08) 0 2px, transparent 2px 86px),
            repeating-linear-gradient(0deg, rgba(255, 249, 240, 0.08) 0 2px, transparent 2px 64px),
            linear-gradient(180deg, rgba(118, 82, 55, 0.2), #4e3528);
          border-top: 1px solid rgba(255, 249, 240, 0.22);
          box-shadow: inset 0 28px 60px rgba(44, 31, 24, 0.3);
        }

        .streetLine {
          position: absolute;
          left: 50%;
          bottom: 0;
          width: 1px;
          height: 120%;
          background: linear-gradient(180deg, rgba(255, 249, 240, 0), rgba(255, 249, 240, 0.2));
          transform-origin: bottom;
        }

        .streetLineOne { transform: rotate(18deg); }
        .streetLineTwo { transform: rotate(-18deg); }
        .streetLineThree { transform: translateX(-50%); opacity: 0.42; }

        .storeScene {
          position: absolute;
          left: 50%;
          bottom: 11vh;
          z-index: 5;
          width: clamp(360px, 62vw, 840px);
          transform: translateX(-50%) translateY(18px) scale(0.86);
          transform-origin: center bottom;
          animation: storeApproach 5.45s cubic-bezier(.16, 1, .3, 1) forwards;
        }

        .storeAwning {
          position: relative;
          z-index: 4;
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          width: 88%;
          height: clamp(34px, 5vw, 58px);
          margin: 0 auto;
          border-radius: 26px 26px 10px 10px;
          overflow: hidden;
          border: 1px solid rgba(255, 249, 240, 0.3);
          box-shadow: 0 18px 36px rgba(44, 31, 24, 0.26);
        }

        .storeAwning span:nth-child(odd) {
          background: linear-gradient(180deg, #fff9f0, #d9bf91);
        }

        .storeAwning span:nth-child(even) {
          background: linear-gradient(180deg, #7c4f37, #3b261d);
        }

        .storeFacade {
          position: relative;
          display: grid;
          grid-template-columns: 1fr 1.18fr 1fr;
          gap: clamp(14px, 2.2vw, 26px);
          align-items: end;
          min-height: clamp(260px, 37vw, 430px);
          padding: clamp(72px, 8vw, 104px) clamp(22px, 4vw, 52px) clamp(24px, 3vw, 40px);
          background:
            linear-gradient(180deg, rgba(255, 249, 240, 0.96), rgba(230, 210, 176, 0.94)),
            repeating-linear-gradient(90deg, rgba(176, 138, 69, 0.12) 0 1px, transparent 1px 80px);
          border: 1px solid rgba(255, 249, 240, 0.5);
          border-radius: 34px 34px 18px 18px;
          box-shadow:
            0 34px 90px rgba(44, 31, 24, 0.36),
            inset 0 0 0 1px rgba(176, 138, 69, 0.2);
        }

        .storeSign {
          position: absolute;
          left: 50%;
          top: clamp(18px, 2.2vw, 28px);
          width: min(460px, 72%);
          transform: translateX(-50%);
          text-align: center;
          padding: 14px 22px 16px;
          border-radius: 999px;
          background:
            linear-gradient(135deg, rgba(44, 31, 24, 0.96), rgba(86, 58, 40, 0.94)),
            radial-gradient(circle at top, rgba(215, 180, 111, 0.25), transparent 60%);
          border: 1px solid rgba(215, 180, 111, 0.46);
          box-shadow: 0 16px 36px rgba(44, 31, 24, 0.22);
        }

        .storeSign small {
          display: block;
          margin-bottom: 4px;
          color: #d7b46f;
          font-size: 10px;
          letter-spacing: 0.32em;
          text-transform: uppercase;
        }

        .storeSign h1 {
          margin: 0;
          color: #fff9f0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(26px, 4vw, 52px);
          font-weight: 500;
          letter-spacing: 0.18em;
        }

        .boutiqueWindow {
          position: relative;
          height: clamp(150px, 20vw, 236px);
          border-radius: 999px 999px 18px 18px;
          overflow: hidden;
          background:
            linear-gradient(135deg, rgba(255, 249, 240, 0.35), rgba(89, 62, 44, 0.52)),
            radial-gradient(circle at 50% 28%, rgba(255, 249, 240, 0.48), transparent 40%);
          border: 10px solid rgba(44, 31, 24, 0.9);
          box-shadow:
            inset 0 0 26px rgba(255, 249, 240, 0.24),
            0 18px 36px rgba(44, 31, 24, 0.16);
        }

        .windowShine {
          position: absolute;
          inset: -20%;
          background: linear-gradient(110deg, transparent 25%, rgba(255, 249, 240, 0.28) 45%, transparent 58%);
          transform: translateX(-55%);
          animation: windowShine 2.8s ease 1.2s forwards;
        }

        .displayPedestal {
          position: absolute;
          left: 50%;
          bottom: 10%;
          width: 46%;
          height: 13%;
          border-radius: 50%;
          transform: translateX(-50%);
          background: rgba(255, 249, 240, 0.38);
          filter: blur(0.3px);
        }

        .displayDress {
          position: absolute;
          left: 50%;
          bottom: 20%;
          width: 42px;
          height: 82px;
          transform: translateX(-50%);
          background:
            radial-gradient(circle at 50% 10%, #fff9f0 0 9px, transparent 10px),
            linear-gradient(180deg, transparent 0 18px, #f8ead4 18px 35px, #d7b46f 35px 100%);
          clip-path: polygon(45% 0, 55% 0, 66% 22%, 86% 100%, 14% 100%, 34% 22%);
          opacity: 0.9;
        }

        .displayScarf {
          position: absolute;
          left: 50%;
          bottom: 24%;
          width: 88px;
          height: 88px;
          transform: translateX(-50%) rotate(45deg);
          border-radius: 12px;
          background:
            linear-gradient(135deg, rgba(255, 249, 240, 0.95), rgba(215, 180, 111, 0.58)),
            linear-gradient(45deg, transparent 45%, rgba(44, 31, 24, 0.22) 46% 52%, transparent 53%);
          border: 1px solid rgba(44, 31, 24, 0.16);
          opacity: 0.92;
        }

        .storeDoorWrap {
          position: relative;
          height: clamp(190px, 26vw, 310px);
          border-radius: 28px 28px 10px 10px;
          background: rgba(44, 31, 24, 0.82);
          border: 10px solid rgba(44, 31, 24, 0.96);
          box-shadow:
            inset 0 0 32px rgba(255, 249, 240, 0.14),
            0 24px 50px rgba(44, 31, 24, 0.24);
          overflow: hidden;
          transform-style: preserve-3d;
        }

        .doorGlow {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at center, rgba(255, 249, 240, 0.98), rgba(215, 180, 111, 0.52) 42%, transparent 72%);
          opacity: 0;
          filter: blur(2px);
          animation: doorGlowIn 2.2s ease 2.65s forwards;
        }

        .doorPanel {
          position: absolute;
          top: 0;
          width: 50.5%;
          height: 100%;
          background:
            linear-gradient(135deg, rgba(100, 68, 48, 0.94), rgba(44, 31, 24, 0.96)),
            repeating-linear-gradient(90deg, rgba(255, 249, 240, 0.08) 0 1px, transparent 1px 46px);
          border: 1px solid rgba(215, 180, 111, 0.18);
          transform-style: preserve-3d;
        }

        .doorPanel::before {
          content: "";
          position: absolute;
          inset: 16px;
          border: 1px solid rgba(215, 180, 111, 0.22);
          border-radius: 18px;
        }

        .doorPanelLeft {
          left: 0;
          transform-origin: left center;
          animation: doorLeftOpen 1.65s cubic-bezier(.16, 1, .3, 1) 2.55s forwards;
        }

        .doorPanelRight {
          right: 0;
          transform-origin: right center;
          animation: doorRightOpen 1.65s cubic-bezier(.16, 1, .3, 1) 2.55s forwards;
        }

        .doorHandle {
          position: absolute;
          top: 52%;
          width: 8px;
          height: 42px;
          border-radius: 999px;
          background: linear-gradient(180deg, #fff4d5, #d7b46f, #9f783d);
          box-shadow: 0 0 18px rgba(215, 180, 111, 0.34);
        }

        .doorPanelLeft .doorHandle { right: 20px; }
        .doorPanelRight .doorHandle { left: 20px; }

        .storeSteps {
          width: 78%;
          margin: 0 auto;
        }

        .storeSteps span {
          display: block;
          height: clamp(10px, 1.3vw, 18px);
          margin: 0 auto;
          background: linear-gradient(180deg, #d7b46f, #8b6942);
          border-radius: 0 0 999px 999px;
          box-shadow: 0 12px 28px rgba(44, 31, 24, 0.28);
        }

        .storeSteps span:first-child { width: 86%; }
        .storeSteps span:last-child { width: 96%; opacity: 0.72; }

        .loaderInner {
          position: absolute;
          left: 50%;
          bottom: clamp(34px, 6vh, 72px);
          z-index: 12;
          width: min(680px, 88vw);
          transform: translateX(-50%);
          text-align: center;
          animation: loaderTextMove 4.6s cubic-bezier(.16, 1, .3, 1) forwards;
        }

        .loaderKicker {
          margin: 0 0 12px;
          color: #fff4d5;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          font-size: 11px;
          text-shadow: 0 8px 22px rgba(44, 31, 24, 0.4);
        }

        .loaderInner h1 {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(38px, 7vw, 92px);
          letter-spacing: 0.18em;
          font-weight: 500;
          color: #fff9f0;
          text-shadow: 0 18px 42px rgba(44, 31, 24, 0.46);
          animation: loaderLogo 1.35s cubic-bezier(.16, 1, .3, 1) both;
        }

        .loaderInner p:not(.loaderKicker) {
          margin: 18px 0 0;
          color: #fff4d5;
          letter-spacing: 0.22em;
          text-align: center;
          text-transform: uppercase;
          font-size: 11px;
          text-shadow: 0 8px 18px rgba(44, 31, 24, 0.34);
          animation: fadeUp 1s ease 0.45s both;
        }

        .loaderLine {
          width: 0;
          height: 1px;
          margin: 28px auto 0;
          background: linear-gradient(90deg, transparent, #fff4d5, #d7b46f, transparent);
          animation: loaderLine 3.8s ease 0.7s forwards;
        }

        .enterGlow {
          position: absolute;
          left: 50%;
          top: 52%;
          z-index: 10;
          width: 18vw;
          height: 18vw;
          min-width: 180px;
          min-height: 180px;
          border-radius: 50%;
          transform: translate(-50%, -50%) scale(0.2);
          background: radial-gradient(circle, rgba(255, 249, 240, 0.95), rgba(215, 180, 111, 0.36) 45%, transparent 70%);
          opacity: 0;
          filter: blur(3px);
          animation: enterGlowExpand 1.45s cubic-bezier(.16, 1, .3, 1) 3.65s forwards;
        }

        @keyframes storeApproach {
          0% { opacity: 0; transform: translateX(-50%) translateY(38px) scale(0.76); }
          18% { opacity: 1; }
          62% { transform: translateX(-50%) translateY(8px) scale(0.95); }
          100% { transform: translateX(-50%) translateY(18px) scale(1.22); }
        }

        @keyframes doorLeftOpen {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(-74deg); }
        }

        @keyframes doorRightOpen {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(74deg); }
        }

        @keyframes doorGlowIn {
          0% { opacity: 0; transform: scale(0.82); }
          55% { opacity: 0.85; }
          100% { opacity: 1; transform: scale(1.2); }
        }

        @keyframes enterGlowExpand {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.2); }
          28% { opacity: 0.9; }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(7); }
        }

        @keyframes boutiqueFlash {
          0% { opacity: 0; }
          55% { opacity: 0.82; }
          100% { opacity: 0; }
        }

        @keyframes skyBreathe {
          from { transform: scale(1); filter: saturate(0.95); }
          to { transform: scale(1.05); filter: saturate(1.08); }
        }

        @keyframes sunGlow {
          from { opacity: 0.55; transform: scale(0.96); }
          to { opacity: 0.95; transform: scale(1.04); }
        }

        @keyframes windowShine {
          from { transform: translateX(-65%) rotate(4deg); }
          to { transform: translateX(72%) rotate(4deg); }
        }

        @keyframes loaderLogo {
          from {
            opacity: 0;
            letter-spacing: 0.05em;
            transform: translateY(18px) scale(0.98);
          }
          to {
            opacity: 1;
            letter-spacing: 0.18em;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes loaderLine {
          from { width: 0; opacity: 0; }
          20% { opacity: 1; }
          78% { width: min(460px, 76vw); opacity: 1; }
          to { width: min(460px, 76vw); opacity: 0; }
        }

        @keyframes loaderTextMove {
          0% { opacity: 0; transform: translateX(-50%) translateY(22px); }
          18% { opacity: 1; transform: translateX(-50%) translateY(0); }
          72% { opacity: 1; transform: translateX(-50%) translateY(0); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-18px); }
        }

        @keyframes loaderOut {
          to {
            opacity: 0;
            pointer-events: none;
            transform: scale(1.015);
          }
        }

        @media (max-width: 900px) {
          .storeScene {
            width: min(92vw, 620px);
            bottom: 15vh;
          }

          .storeFacade {
            grid-template-columns: 0.78fr 1.2fr 0.78fr;
            gap: 12px;
            padding-left: 18px;
            padding-right: 18px;
          }

          .storeSign {
            width: 78%;
          }

          .boutiqueWindow {
            border-width: 7px;
          }

          .loaderInner {
            bottom: 34px;
          }
        }

        @media (max-width: 560px) {
          .storeScene {
            width: 104vw;
            bottom: 18vh;
          }

          .storeFacade {
            min-height: 300px;
            grid-template-columns: 0.62fr 1.32fr 0.62fr;
            gap: 8px;
            border-radius: 28px 28px 16px 16px;
            padding-top: 82px;
          }

          .storeAwning {
            width: 82%;
            height: 38px;
          }

          .storeSign {
            width: 82%;
            padding: 11px 14px 12px;
          }

          .storeSign small {
            font-size: 8px;
            letter-spacing: 0.22em;
          }

          .storeSign h1 {
            font-size: 25px;
            letter-spacing: 0.14em;
          }

          .boutiqueWindow {
            height: 142px;
            border-width: 6px;
          }

          .storeDoorWrap {
            height: 198px;
            border-width: 7px;
          }

          .displayDress {
            width: 30px;
            height: 62px;
          }

          .displayScarf {
            width: 54px;
            height: 54px;
          }

          .loaderInner h1 {
            font-size: clamp(34px, 10vw, 52px);
            letter-spacing: 0.13em;
          }

          .loaderInner p:not(.loaderKicker),
          .loaderKicker {
            font-size: 9px;
            letter-spacing: 0.16em;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .loader,
          .loader *,
          .loader::before,
          .loader::after {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.001ms !important;
          }
        }
`;

const oldLoaderCssPattern =
  /\s*\.loader\s*\{[\s\S]*?@keyframes loaderOut\s*\{[\s\S]*?\n\s*\}\s*\n\s*@keyframes pageFade/;

if (!oldLoaderCssPattern.test(appCode)) {
  console.error("❌ Could not find the old loader CSS block.");
  console.error("Tip: If you already edited the loader CSS before, paste App.tsx to ChatGPT and ask for a manual merge.");
  process.exit(1);
}

appCode = appCode.replace(oldLoaderCssPattern, `${newLoaderCss}\n\n        @keyframes pageFade`);

if (appCode === oldAppCode) {
  console.error("❌ No changes were made.");
  process.exit(1);
}

fs.writeFileSync(appPath, appCode, "utf8");

console.log("✅ Done. src/App.tsx has been updated with the La Grazia Italian boutique entry animation.");
console.log("✅ Next run:");
console.log("   npm run build");
console.log("   npm run dev");
