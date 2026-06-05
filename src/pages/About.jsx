import { Helmet } from 'react-helmet-async';

export default function About() {
  return (
    <>
      <Helmet><title>About Us | ViteNest</title></Helmet>
      <main className="container" style={{paddingTop: '120px', minHeight: '80vh'}}>
        <h1>Our Mission</h1>
        <p>Establish authority and explain the business model.</p>
      </main>
    </>
  );
}
