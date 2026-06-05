import { Helmet } from 'react-helmet-async';

export default function Advertise() {
  return (
    <>
      <Helmet><title>Advertise With Us | ViteNest</title></Helmet>
      <main className="container" style={{paddingTop: '120px', minHeight: '80vh'}}>
        <h1>Advertise With Us</h1>
        <p>Attract direct sponsors for the platform.</p>
      </main>
    </>
  );
}
