import { arizonaFlare } from '../fonts';


type TruncatedDescriptionProps = {
    htmlString: string;
    maxChar?: number;
  };
  
  function TruncatedDescription({ htmlString, maxChar = 300 }: TruncatedDescriptionProps) {
    const stripHtml = (html: string) => {
      const div = document.createElement('div');
      div.innerHTML = html;
      return div.textContent || div.innerText || '';
    };
  
    const textContent = stripHtml(htmlString);
    const shouldTruncate = textContent.length > maxChar;
    const shortText = textContent.slice(0, maxChar) + '...';
  
    const displayHtml = shouldTruncate ? shortText : htmlString;
  
    return (
      <div className={`text-gray-500 text-md font-regular text-wrap md:text-lg leading-relaxed ${arizonaFlare.className} prose prose-gray max-w-none`}>
        <div
          dangerouslySetInnerHTML={{
            __html: displayHtml,
          }}
        />
        
      </div>
    );
  }

  export default TruncatedDescription;