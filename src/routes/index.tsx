import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import bearGiggle from "@/assets/bear-giggle.png";
import bearHeart from "@/assets/bear-heart.png";
import bearParty from "@/assets/bear-party.png";
import { getBirthdayAccess, unlockBirthday } from "@/lib/birthday-access.functions";

export const Route = createFileRoute("/")({
  loader: () => getBirthdayAccess(),
  head: () => ({
    meta: [
      { title: "Zainab's Birthday Investigation — A Top Secret Surprise" },
      {
        name: "description",
        content:
          "A playful top-secret birthday investigation for Zainab: quizzes, balloons, a classified report and a very special birthday wish.",
      },
      { property: "og:title", content: "Zainab's Birthday Investigation" },
      {
        property: "og:description",
        content:
          "Pop balloons, pass identity verification and unlock Zainab's official birthday report.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  errorComponent: BirthdayAccessError,
  notFoundComponent: BirthdayAccessError,
  component: BirthdayApp,
});

const TOTAL_PAGES = 8;

type Burst = { id: number; x: number; y: number; char: string; color: string; dx: number; dy: number };

const CONFETTI_COLORS = ["#ff3f78", "#7040d9", "#ffd85c", "#4d9de0", "#5fc98a"];

function BirthdayApp() {
  const initialAccess = Route.useLoaderData();
  const unlock = useServerFn(unlockBirthday);
  const [unlocked, setUnlocked] = useState(initialAccess.unlocked);
  const [unlocking, setUnlocking] = useState(false);
  const [accessError, setAccessError] = useState("");
  const [page, setPage] = useState(1);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const idRef = useRef(0);
  const topRef = useRef<HTMLDivElement | null>(null);

  const goTo = useCallback((n: number) => {
    if (n < 1 || n > TOTAL_PAGES) return;
    setPage(n);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const burstAt = useCallback((el: HTMLElement, chars = ["★", "✦", "💥", "🎈", "✨"]) => {
    const rect = el.getBoundingClientRect();
    const pieces: Burst[] = Array.from({ length: 14 }, () => {
      idRef.current += 1;
      return {
        id: idRef.current,
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        char: chars[Math.floor(Math.random() * chars.length)]!,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]!,
        dx: (Math.random() - 0.5) * 220,
        dy: (Math.random() - 0.5) * 200,
      };
    });
    setBursts((b) => [...b, ...pieces]);
    const ids = new Set(pieces.map((p) => p.id));
    window.setTimeout(() => setBursts((b) => b.filter((p) => !ids.has(p.id))), 800);
  }, []);

  async function handleUnlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAccessError("");
    setUnlocking(true);

    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "");
    const dateOfBirth = String(form.get("dateOfBirth") ?? "");

    try {
      const result = await unlock({ data: { name, dateOfBirth } });
      if (!result.ok) {
        setAccessError("ACCESS DENIED! The birthday detectives could not verify those details. Try again, suspect. 🧐");
        setUnlocking(false);
        return;
      }

      window.setTimeout(() => setUnlocked(true), 850);
    } catch {
      setAccessError("The investigation machine hiccupped. Please try again.");
      setUnlocking(false);
    }
  }

  if (!unlocked) {
    return (
      <main className={`bd-login ${unlocking ? "is-unlocking" : ""}`}>
        <div className="bd-login-beam" aria-hidden="true" />
        <img className="bd-login-bear bear-peek" src={bearGiggle} alt="" width={768} height={768} />
        <img className="bd-login-bear bear-guard" src={bearHeart} alt="" width={768} height={768} />

        <section className="bd-login-panel" aria-labelledby="access-title">
          <div className="bd-login-stamp">TOP SECRET</div>
          <p className="bd-login-kicker">CASE NO. 15·09·08</p>
          <div className="bd-login-lock" aria-hidden="true">🔐</div>
          <h1 id="access-title">IDENTITY CHECK</h1>
          <p className="bd-login-copy">Enter your date of birth to access the investigation file.</p>

          <form className="bd-login-form" onSubmit={handleUnlock}>
            <label htmlFor="birthday-name">Suspect&apos;s full name</label>
            <input
              id="birthday-name"
              name="name"
              type="text"
              placeholder="e.g. Zainab Imran"
              autoComplete="name"
              maxLength={80}
              required
              disabled={unlocking}
            />

            <label htmlFor="birthday-dob">Date of birth</label>
            <input
              id="birthday-dob"
              name="dateOfBirth"
              type="text"
              inputMode="numeric"
              placeholder="DD-MM-YYYY (e.g. 01-01-2000)"
              autoComplete="bday"
              maxLength={20}
              required
              disabled={unlocking}
              aria-describedby="birthday-format birthday-access-error"
            />
            <small id="birthday-format">Dashes are optional. Detective hats are encouraged.</small>

            <p id="birthday-access-error" className={`bd-login-error ${accessError ? "show" : ""}`} role="alert">
              {accessError}
            </p>

            <button className="bd-btn bd-login-submit" type="submit" disabled={unlocking}>
              {unlocking ? "UNLOCKING FILE... 🔎" : "ACCESS INVESTIGATION FILE 🔍"}
            </button>
          </form>
          <p className="bd-login-warning">⚠ Authorized birthday girl only. Intruders will be dramatically judged.</p>
        </section>
      </main>
    );
  }

  return (
    <div className="bd-root">
      <div ref={topRef} />

      {/* floating funny stickers */}
      <div className="bd-floaters" aria-hidden="true">
        <span className="bd-float f1">WOW 😳</span>
        <span className="bd-float f2">HUH? 🤨</span>
        <span className="bd-float f3">LOL 😹</span>
        <span className="bd-float f4">404 🧠</span>
        <span className="bd-float f5">YAY 🥳</span>
        <span className="bd-float f6">🍰</span>
        <span className="bd-float f7">🎈</span>
      </div>

      {/* click bursts */}
      <div className="bd-bursts" aria-hidden="true">
        {bursts.map((b) => (
          <span
            key={b.id}
            className="bd-burst"
            style={
              {
                left: `${b.x}px`,
                top: `${b.y}px`,
                color: b.color,
                ["--dx" as string]: `${b.dx}px`,
                ["--dy" as string]: `${b.dy}px`,
              } as React.CSSProperties
            }
          >
            {b.char}
          </span>
        ))}
      </div>

      <div className="bd-dots" aria-hidden="true">
        {Array.from({ length: TOTAL_PAGES }, (_, i) => (
          <span key={i} className={i + 1 === page ? "active" : ""} />
        ))}
      </div>

      <main>
        {page === 1 && <PageOne goTo={goTo} />}
        {page === 2 && <PageTwo goTo={goTo} />}
        {page === 3 && <PageThree goTo={goTo} burstAt={burstAt} />}
        {page === 4 && <PageFour goTo={goTo} />}
        {page === 5 && <PageFive goTo={goTo} />}
        {page === 6 && <PageSix goTo={goTo} />}
        {page === 7 && <PageSeven onClick={() => goTo(8)} />}
        {page === 8 && <PageEight />}
      </main>
    </div>
  );
}

function BirthdayAccessError() {
  return (
    <main className="bd-login">
      <section className="bd-login-panel">
        <div className="bd-login-lock" aria-hidden="true">🕵️</div>
        <h1>CASE FILE TEMPORARILY LOST</h1>
        <p className="bd-login-copy">The detective desk needs a moment. Please refresh and try again.</p>
      </section>
    </main>
  );
}

/* ---------------- Page 1 ---------------- */
function PageOne({ goTo }: { goTo: (n: number) => void }) {
  return (
    <section className="bd-page p1">
      <div className="bd-sticker q">???</div>
      <div className="bd-sticker note">
        HANDLE WITH CARE
        <br />
        <small>(she&apos;s special)</small>
      </div>
      <div className="bd-detective">
        🕵️ INSPECTOR
        <br />
        <span>01</span>
      </div>

      <p className="bd-eyebrow">⚠️ TOP SECRET CASE FILE ⚠️</p>
      <h1 className="bd-wobble">IMPORTANT NOTICE</h1>
      <p className="bd-sub">A very suspicious person named</p>
      <h2 className="bd-pop-name">ZAINAB</h2>
      <p className="bd-sub">has a birthday today...</p>

      <div className="bd-file">
        <span>INVESTIGATION FILE</span>
        <strong>ZAINAB 💕</strong>
        <small>CASE STATUS: EXTREMELY SUSPICIOUS</small>
        <div className="bd-meter">
          <span>Suspicious level</span>
          <div className="bd-bar">
            <i className="bd-bar-fill" style={{ width: "99%" }} />
          </div>
          <b>99%</b>
        </div>
      </div>

      <button className="bd-btn bd-jelly" onClick={() => goTo(2)}>
        INVESTIGATE 🔍
      </button>
      <p className="bd-tiny">Click carefully. This website contains highly classified nonsense.</p>
    </section>
  );
}

/* ---------------- Page 2 ---------------- */
const QUESTIONS = [
  {
    q: "Q1. Are you always right?",
    right: "Obviously",
    wrong: "Never",
    rightMsg: "Correct. The investigation may continue. 😎",
    wrongMsg: "Incorrect. Please reconsider your life choices. 🙃",
  },
  {
    q: "Q2. Are you annoying?",
    right: "Never. Absolutely not.",
    wrong: "Yes, I am. (masla?)",
    rightMsg: "Correct. We shall preserve this important fact. 📁",
    wrongMsg: "At least you are honest. But NO. 😤",
  },
  {
    q: "Q3. Do you deserve a birthday wish?",
    right: "Yes",
    wrong: "No",
    rightMsg: "Obviously. Finally, some common sense. 🎂",
    wrongMsg: "NOPE. Rejected by the birthday department. 🚫",
  },
];

function PageTwo({ goTo }: { goTo: (n: number) => void }) {
  const [done, setDone] = useState<boolean[]>([false, false, false]);
  const [shake, setShake] = useState<number | null>(null);
  const [msg, setMsg] = useState("Answer all three correctly to continue.");
  const solved = done.every(Boolean);

  useEffect(() => {
    if (solved) setMsg("VERIFICATION PASSED. Zainab has officially been identified. ✅");
  }, [solved]);

  return (
    <section className="bd-page p2">
      <p className="bd-eyebrow">🔐 IDENTITY VERIFICATION</p>
      <h1 className="bd-wobble">ZAINAB, PROVE IT.</h1>
      <p className="bd-sub">Only the scientifically correct answers unlock the next page.</p>

      <div className="bd-quiz">
        {QUESTIONS.map((item, i) => (
          <div className="bd-question" key={item.q}>
            <h3>{item.q}</h3>
            <div className="bd-options">
              <button
                className={done[i] ? "correct" : ""}
                onClick={() => {
                  if (done[i]) return;
                  setDone((d) => d.map((v, idx) => (idx === i ? true : v)));
                  setMsg(item.rightMsg);
                }}
              >
                ⭐ {item.right}
              </button>
              <button
                className={shake === i ? "wrong" : ""}
                onClick={() => {
                  if (done[i]) return;
                  setMsg(item.wrongMsg);
                  setShake(i);
                  window.setTimeout(() => setShake(null), 450);
                }}
              >
                ✖ {item.wrong}
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="bd-reaction">{msg}</p>
      {solved && (
        <button className="bd-btn bd-jelly" onClick={() => goTo(3)}>
          VERIFICATION COMPLETE ➜
        </button>
      )}
    </section>
  );
}

/* ---------------- Page 3 ---------------- */
const BALLOONS = [
  "YOU ARE SPECIAL 💖",
  "YOU ARE GORGEOUS ✨",
  "YOU ARE KIND-HEARTED 🫶",
  "YOU ARE HILARIOUS 😂",
  "YOU ARE UNFORGETTABLE 🌙",
  "YOU ARE STRONG 💪",
  "YOU ARE ONE OF A KIND 🦄",
  "YOU ARE SERIOUSLY AWESOME 🔥",
  "YOU SURVIVED THIS WEBSITE 🏆",
];

function PageThree({
  goTo,
  burstAt,
}: {
  goTo: (n: number) => void;
  burstAt: (el: HTMLElement) => void;
}) {
  const [popped, setPopped] = useState<number[]>([]);
  const [msg, setMsg] = useState("POP THEM ALL 🎈");
  const [msgKey, setMsgKey] = useState(0);
  const all = popped.length === 9;

  return (
    <section className="bd-page p3">
      <p className="bd-eyebrow">🎈 ROUND 01</p>
      <h1 className="bd-wobble">POP THE BALLOONS</h1>
      <p className="bd-sub">Nine balloons. Nine facts. Zero escape.</p>

      <div className="bd-balloons">
        {BALLOONS.map((text, i) => {
          const isPopped = popped.includes(i);
          return (
            <button
              key={text}
              className={`bd-balloon b${i + 1} ${isPopped ? "popped" : ""}`}
              onClick={(e) => {
                if (isPopped) return;
                burstAt(e.currentTarget);
                const next = [...popped, i];
                setPopped(next);
                setMsgKey((key) => key + 1);
                if (next.length === 9) {
                  setMsg("MISSION COMPLETE. 9/9 balloons defeated. 🏅");
                } else {
                  setMsg(text);
                }
              }}

            >
              {i + 1}
            </button>
          );
        })}
      </div>

      <div
        key={msgKey}
        className={`bd-big-reaction ${msgKey > 0 ? "show" : ""}`}
        role="status"
        aria-live="polite"
      >
        {msg}
      </div>
      <p className="bd-tiny">{popped.length}/9 popped</p>
      {all && (
        <button className="bd-btn bd-jelly" onClick={() => goTo(4)}>
          CONTINUE ➜
        </button>
      )}
    </section>
  );
}

/* ---------------- Page 4 ---------------- */
const FRIEND: Record<string, { label: string; letter: string; msg: string }> = {
  no: { letter: "A", label: "No", msg: "OHHH... CRITICAL DAMAGE. 😭 A complaint has been filed." },
  abs: { letter: "B", label: "Absolutely not", msg: "WOW. I WAS NOT READY FOR THIS DISRESPECT. 😢" },
  hmm: { letter: "C", label: "Hmm yeah", msg: "HMM YEAH?! THAT'S IT?! 😾 Most unconvincing answer ever." },
  best: { letter: "D", label: "Bestest", msg: "CORRECT ANSWER DETECTED. RUMMAN HAS BEEN CLEARED. 😎" },
};

function PageFour({ goTo }: { goTo: (n: number) => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  const [flash, setFlash] = useState(0);

  return (
    <section className="bd-page p4 dark">
      <p className="bd-eyebrow">🧪 HIGHLY IMPORTANT RESEARCH</p>
      <h1 className="bd-wobble">IS RUMMAN A GOOD FRIEND?</h1>
      <p className="bd-sub">Choose an option and face the consequences.</p>

      <div className="bd-friend-options">
        {Object.entries(FRIEND).map(([key, item]) => (
          <button
            key={key}
            className={picked === key ? "picked" : ""}
            onClick={() => {
              setPicked(key);
              setFlash((f) => f + 1);
            }}
          >
            <b>{item.letter}</b>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div key={flash} className="bd-friend-reaction flash">
        {picked ? FRIEND[picked]!.msg : "WAITING FOR YOUR JUDGEMENT... 👀"}
      </div>
      {picked && (
        <>
          <p className="bd-tiny">Wait... any of these hurt, but D made my day! 🐥</p>
          <button className="bd-btn bd-jelly" onClick={() => goTo(5)}>
            I HAVE SEEN ENOUGH ➜
          </button>
        </>
      )}
    </section>
  );
}

/* ---------------- Page 5 ---------------- */
const REPORT_ROWS: Array<[string, string, number | null]> = [
  ["Annoying level", "100%", 100],
  ["Drama level", "90%", 90],
  ["Overthinking", "95%", 95],
  ["Cuteness level", "110%", 100],
  ["Bestie level", "∞", null],
  ["Brain cells remaining", "404 NOT FOUND", null],
];

function PageFive({ goTo }: { goTo: (n: number) => void }) {
  const [revealed, setRevealed] = useState(false);
  const [age, setAge] = useState("Loading...");

  useEffect(() => {
    if (!revealed) return;
    const frames = ["Loading...", "Still loading...", "Calculating...", "ERROR: TOO CLASSIFIED"];
    let i = 0;
    const timer = window.setInterval(() => {
      i += 1;
      setAge(frames[i % frames.length]!);
    }, 480);
    const stop = window.setTimeout(() => {
      window.clearInterval(timer);
      setAge("TOP SECRET 🤫");
    }, 2800);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(stop);
    };
  }, [revealed]);

  return (
    <section className="bd-page p5 dark">
      <p className="bd-eyebrow">🗂️ CLASSIFIED DOCUMENT</p>
      <h1 className="bd-wobble">ZAINAB&apos;S OFFICIAL BIRTHDAY REPORT</h1>
      <p className="bd-sub">Classified information detected 💀 100% accurate. Probably.</p>

      {!revealed ? (
        <div className="bd-folder">
          <div className="bd-folder-label">TOP SECRET</div>
          <p>Are you ready to see the truth about yourself? 😎</p>
          <button className="bd-btn green bd-jelly" onClick={() => setRevealed(true)}>
            REVEAL MY REPORT
          </button>
        </div>
      ) : (
        <div className="bd-report">
          <div className="bd-report-row">
            <span>Age</span>
            <strong>{age}</strong>
          </div>
          {REPORT_ROWS.map(([label, value, width], i) => (
            <div key={label}>
              <div className="bd-report-row">
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
              {width !== null && (
                <div className="bd-bar">
                  <i className="bd-bar-fill" style={{ width: `${width}%`, animationDelay: `${i * 0.12}s` }} />
                </div>
              )}
            </div>
          ))}
          <p className="bd-tiny">⚠️ Warning: 100% accurate. Handle with care.</p>
          <button className="bd-btn bd-jelly" onClick={() => goTo(6)}>
            OKAY OKAY... ENOUGH ROASTING 😅
          </button>
        </div>
      )}
    </section>
  );
}

/* ---------------- Page 6: the wish ---------------- */
function PageSix({ goTo }: { goTo: (n: number) => void }) {
  return (
    <section className="bd-page p6">
      <img className="bd-wish-bear bear-giggle" src={bearGiggle} alt="A cute giggling white bear" width={768} height={768} loading="lazy" />
      <img className="bd-wish-bear bear-heart" src={bearHeart} alt="A cute teddy bear holding a heart" width={768} height={768} loading="lazy" />
      <img className="bd-wish-bear bear-party" src={bearParty} alt="A funny party panda dancing" width={768} height={768} loading="lazy" />

      <p className="bd-eyebrow">💌 THE SERIOUS PART</p>
      <h1 className="bd-script">Happy Birthday, Zainab! 🎉</h1>

      <div className="bd-polaroids">
        <div className="bd-polaroid one">
          <div className="bd-polaroid-img">🫶</div>
          <small>us being us</small>
        </div>
        <div className="bd-polaroid two">
          <div className="bd-polaroid-img">🧋</div>
          <small>endless memories</small>
        </div>
      </div>

      <div className="bd-letter">
        <p>Today is officially your day, so the investigation is temporarily suspended:</p>
        <p>
          You are not just my best friend; you are my person, my therapist, my entertainment, my partner in
          crime, and my daily dose of fight. 🥰🥳
        </p>
        <p>Thanks for being you—for all the laughs, the craziness, and the endless memories. 💓</p>
        <p>I hope I shall be your best friend in every life.</p>
      </div>

      <div className="bd-ribbon">You deserve all the happiness in the world! ⭐</div>

      <button className="bd-btn bd-jelly" onClick={() => goTo(7)}>
        ONE LAST THING... ➜
      </button>
    </section>
  );
}

/* ---------------- Page 7 ---------------- */
function PageSeven({ onClick }: { onClick: () => void }) {
  return (
    <section className="bd-page p7 dark">
      <div className="bd-sticker note">
        GET READY
        <br />
        TO SMILE BIG 😄
      </div>
      <p className="bd-eyebrow">🚨 FINAL SECURITY CHECK</p>
      <h1 className="bd-wobble">ONE LAST THING...</h1>
      <p className="bd-sub">The birthday department has prepared one final surprise.</p>
      <button className="bd-btn huge bd-heartbeat" onClick={onClick}>
        CLICK ME 🎁
      </button>
    </section>
  );
}

/* ---------------- Page 8 ---------------- */
function PageEight() {
  const [cakeTaps, setCakeTaps] = useState(0);
  const cakeLines = [
    "HEY! That tickles! 😂",
    "Careful—I'm emotionally layered! 🍰",
    "OW! Make a wish first! 😤",
    "Okay, okay... you win, birthday girl! 🥳",
  ];
  const cakeLine = cakeTaps === 0 ? "tap the cake 🎂" : cakeLines[(cakeTaps - 1) % cakeLines.length];

  return (
    <section className="bd-page p8">
      <div className="bd-buntings" aria-hidden="true">
        {Array.from({ length: 12 }, (_, i) => (
          <i key={i} style={{ animationDelay: `${i * 0.12}s` }} />
        ))}
      </div>
      <div className="bd-banner">HAPPY BIRTHDAY</div>
      <h1 className="bd-pop-name">ZAINAB! 🥳</h1>

      <button
        key={cakeTaps}
        className={`bd-cake ${cakeTaps > 0 ? "tapped" : ""}`}
        aria-label="Tap the funny birthday cake"
        onClick={() => setCakeTaps((count) => count + 1)}
      >
        <span className="bd-flame" />
        <span className="bd-candle" />
        <span className="bd-cake-top" />
        <span className="bd-cake-body" />
        <span className="bd-cake-face" aria-hidden="true">•ᴗ•</span>
      </button>
      <p key={`cake-line-${cakeTaps}`} className={`bd-cake-reaction ${cakeTaps > 0 ? "show" : ""}`} aria-live="polite">
        {cakeLine}
      </p>

      <div className="bd-final-notes">
        <div>
          ANOTHER YEAR OLDER.
          <br />
          ANOTHER YEAR BOLDER. 😎
        </div>
        <div>
          LET&apos;S MAKE THIS YEAR
          <br />
          THE BEST ONE YET! 🚀
        </div>
      </div>

      <p className="bd-final-message">
        Thank you for being in my life. I&apos;m so lucky to have you! Wishing you a day full of fun,
        laughter and everything you love. 🥳
      </p>
      <div className="bd-ribbon big">YOU DESERVE THE BEST, ALWAYS! ✨</div>
      <p className="bd-signature">— Rumman</p>
    </section>
  );
}
