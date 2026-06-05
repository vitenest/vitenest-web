import { Helmet } from 'react-helmet-async';

export default function Legal({ title }) {
  return (
    <>
      <Helmet><title>{title} | ViteNest</title></Helmet>
      <main className="container" style={{paddingTop: '120px', minHeight: '80vh'}}>
        <h1>{title}</h1>
        <p>Standard legal text for compliance and trust.</p>
      </main>
    </>
  );
}
