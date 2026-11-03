import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position="bottom-right"
      duration={1800}
      visibleToasts={2}
      closeButton
      pauseWhenPageIsHidden
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card/95 group-[.toaster]:backdrop-blur-md group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-xl group-[.toaster]:rounded-xl text-xs py-2 px-3.5 font-medium transition-all",
          description: "group-[.toast]:text-muted-foreground text-xs",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground text-xs rounded-md",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground text-xs rounded-md",
          closeButton: "group-[.toast]:bg-card group-[.toast]:border-border text-muted-foreground hover:text-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
