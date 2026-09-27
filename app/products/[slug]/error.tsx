"use client";
export default function Error({reset}:{error:Error&{digest?:string};reset:()=>void}){return <main className="error-box"><h1 style={{fontFamily:"var(--font-display)",fontSize:46,fontWeight:400}}>This little hiccup will pass.</h1><p>We couldn’t load this product.</p><button className="button button-dark" onClick={()=>reset()}>Try again <span>→</span></button></main>;}
