import { Button, ButtonProps } from "./button";

interface RoundButtonProps extends ButtonProps {
  children: React.ReactNode;
}

const RoundButton = ({ children, ...props }: RoundButtonProps) => {
  return (
    <Button
      {...props}
      className="rounded-lg flex items-center justify-center p-0"
    >
      {children}
    </Button>
  );
};

export default RoundButton;
