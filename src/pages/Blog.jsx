import { Helmet } from 'react-helmet-async';

export default function Blog() {
  return (
    <>
      <Helmet><title>Blog | ViteNest</title></Helmet>
      <main className="container" style={{paddingTop: '120px', minHeight: '80vh'}}>
        <h1>Blog & Updates</h1>
        <p>Content marketing, SEO traffic generation, and ecosystem updates.</p>
      </main>
    </>
  );
}
