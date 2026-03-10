"use client";

import { useState } from "react";
import { trackGrowthEvent } from "@/lib/growth-events";

type SubscribeState = "idle" | "loading" | "success" | "error";

/**
 * 홈 화면에서 이메일 구독을 받는 간단한 폼 컴포넌트다.
 * @returns 이메일 구독 폼 UI
 */
export default function NewsletterCapture() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SubscribeState>("idle");
  const [message, setMessage] = useState<string>("");

  /**
   * 구독 API로 이메일을 전송하고 결과 상태를 갱신한다.
   * @param event 폼 제출 이벤트
   * @returns 없음
   */
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) {
      setStatus("error");
      setMessage("이메일을 입력해 주세요.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const payload = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "구독 요청을 처리하지 못했습니다.");
      }

      setStatus("success");
      setMessage(payload.message ?? "구독이 완료되었습니다.");
      setEmail("");
      void trackGrowthEvent({ name: "newsletter_subscribe", page: "home", meta: { source: "newsletter-capture" } });
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.");
    }
  };

  return (
    <form className="subscribe-form mt-sm" onSubmit={submit}>
      <label className="sr-only" htmlFor="newsletter-email">이메일 주소</label>
      <input
        id="newsletter-email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="업무용 이메일 입력"
        autoComplete="email"
      />
      <button type="submit" className="button button-primary" disabled={status === "loading"}>
        {status === "loading" ? "구독 중..." : "업데이트 받기"}
      </button>
      {message ? (
        <p className={status === "error" ? "error-text no-margin" : "inline-note no-margin"}>{message}</p>
      ) : null}
    </form>
  );
}
