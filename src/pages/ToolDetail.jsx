import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';

export default function ToolDetail() {
  const { id } = useParams();
  
  return (
    <>
      <Helmet><title>Tool Detail | ViteNest</title></Helmet>
      <main className="container" style={{paddingTop: '120px', minHeight: '80vh'}}>
        <h1>Tool Name: {id}</h1>
        <p>The main entry point for organic search traffic.</p>
      </main>
    </>
  );
}
