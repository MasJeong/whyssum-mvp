/** 진행 막대 컴포넌트 props (0~100 진행률) */
type ProgressBarProps = {
  value: number;
};

/**
 * 0~100 점수를 시각화하는 공통 진행 막대를 렌더링한다.
 * @param value 진행률 값
 * @returns 진행 막대 UI
 */
export default function ProgressBar({ value }: ProgressBarProps) {
  return (
    <div className="progress-track" role="presentation" aria-hidden="true">
      <div className="progress-fill" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}
