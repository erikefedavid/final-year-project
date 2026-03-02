"use client";

import styled from "styled-components";
import { useTheme } from "next-themes";

const Loader = ({ text }) => {
  const { theme } = useTheme();

  const barColor =
    theme === "dark" ? "#ffffff" : "#183153";

  return (
    <StyledWrapper $color={barColor}>
      <div className="loaderContainer">
        <div className="loaderRectangle">
          <div />
          <div />
          <div />
          <div />
          <div />
        </div>

        {text && <p className="loaderText">{text}</p>}
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--background);
  z-index: 9999;

  .loaderContainer {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
    text-align: center;
  }

  .loaderText {
    font-size: 15px;
    color: ${({ $color }) => $color};
    font-weight: 500;
  }

  .loaderRectangle {
    display: flex;
    justify-content: center;
    align-items: flex-end;
    gap: 4px;
  }

  .loaderRectangle div {
    width: 10px;
    height: 16px;
    animation: 0.9s ease-in-out infinite;
    background: ${({ $color }) => $color};
    box-shadow: 0 0 15px ${({ $color }) => $color}55;
  }

  .loaderRectangle div:nth-child(1) { animation-name: r1; }
  .loaderRectangle div:nth-child(2) { animation-name: r2; }
  .loaderRectangle div:nth-child(3) { animation-name: r3; }
  .loaderRectangle div:nth-child(4) { animation-name: r2; }
  .loaderRectangle div:nth-child(5) { animation-name: r1; }

  @keyframes r1 { 0%,100%{height:16px;} 50%{height:35px;} }
  @keyframes r2 { 0%,100%{height:16px;} 50%{height:45px;} }
  @keyframes r3 { 0%,100%{height:16px;} 50%{height:55px;} }
`;

export default Loader;