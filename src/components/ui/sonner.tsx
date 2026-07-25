import { Toaster as Sonner } from "sonner";
import { CircleCheck, CircleX, Info, TriangleAlert } from "lucide-react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const theme = document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      closeButton
      icons={{
        success: <CircleCheck className="size-5 text-emerald-500" />,
        error: <CircleX className="size-5 text-red-500" />,
        warning: <TriangleAlert className="size-5 text-amber-500" />,
        info: <Info className="size-5 text-blue-500" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast flex w-full items-center rounded-xl border border-l-4 border-border border-l-border bg-background p-4 text-foreground shadow-lg",
          title: "text-sm font-semibold text-foreground",
          description: "mt-0.5 text-sm text-muted-foreground",
          icon: "mr-3 shrink-0",
          closeButton:
            "ml-auto rounded-md border-none bg-transparent text-muted-foreground hover:text-foreground",
          error: "border-l-red-500",
          warning: "border-l-amber-500",
          success: "border-l-emerald-500",
          info: "border-l-blue-500",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
