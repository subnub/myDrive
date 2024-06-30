interface PlayIconProps {
  className?: string;
}

const PlayIcon = (props: PlayIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={props.className}
    >
      <title>play</title>
      <path d="M8,5.14V19.14L19,12.14L8,5.14Z" fill="currentColor" />
    </svg>
  );
};

export default PlayIcon;
