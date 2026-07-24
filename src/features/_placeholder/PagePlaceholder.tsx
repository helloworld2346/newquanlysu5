import { useLocation } from "react-router-dom";  
  
export default function PagePlaceholder() {  
  const { pathname } = useLocation();  
  return (  
    <div className="p-6">  
      <h1 className="text-xl font-semibold">Trang đang xây dựng</h1>  
      <p className="mt-2 text-sm text-muted-foreground">Route: {pathname}</p>  
    </div>  
  );  
}