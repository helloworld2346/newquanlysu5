export default function ReportColGroup() {  
  return (  
    <colgroup>  
      <col className="w-[7%]" /> 
      {Array.from({ length: 17 }).map((_, i) => (  
        <col key={i} className="w-[3.9%]" />
      ))}  
      <col className="w-[7%]" />
      <col className="w-[9%]" />
      <col className="w-[6%]" />
    </colgroup>  
  );  
}