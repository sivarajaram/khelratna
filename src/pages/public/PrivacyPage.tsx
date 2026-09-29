import { LegalPage } from './LegalPage'

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" description="How Khelratna collects, uses and protects personal information.">
      <h2>Information we collect</h2>
      <p>
        When you use the contact form we collect the name, email address, optional phone number and message you provide, so that we can respond to your enquiry.
      </p>
      <h2>Certificate verification</h2>
      <p>Verification displays only the details required to confirm a certificate’s authenticity. Contact details of certificate holders are never shown.</p>
      <h2>How information is used</h2>
      <p>Enquiry details are used only to respond to you and are accessible only to authorised Khelratna administrators.</p>
      <h2>Contact</h2>
      <p>For privacy questions, please use the contact page.</p>
    </LegalPage>
  )
}
