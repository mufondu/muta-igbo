// ─── Legal Screens: Terms, Privacy, Beta Access ──────────────────────────────
// Author: Michael Ufondu

import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLOR, FONT, SPACE } from '../utils/tokens';

function LegalScreen({ title, onBack, children }: {
  title: string; onBack: () => void; children: React.ReactNode;
}) {
  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={onBack} style={s.backBtn} accessibilityLabel="Go back">
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>{title}</Text>
      </View>
      <ScrollView contentContainerStyle={[s.scroll, { width: '100%', maxWidth: 760, alignSelf: 'center' }]} showsVerticalScrollIndicator={false}>
        {children}
        <Text style={s.updated}>Last updated: October 2026</Text>
      </ScrollView>
    </View>
  );
}

function H2({ children }: { children: string }) {
  return <Text style={s.h2}>{children}</Text>;
}

function P({ children }: { children: React.ReactNode }) {
  return <Text style={s.p}>{children}</Text>;
}

function Li({ children }: { children: React.ReactNode }) {
  return <Text style={s.li}>{'\u2022'} {children}</Text>;
}

// ─── TERMS & CONDITIONS ───────────────────────────────────────────────────────
export function TermsScreen({ onBack }: { onBack: () => void }) {
  return (
    <LegalScreen title="Terms & Conditions" onBack={onBack}>
      <H2>1. Acceptance of Terms</H2>
      <P>By creating an account or using Mụta Igbo ("the Service"), you confirm that you are a parent or legal guardian aged 18 or older and that you agree to these Terms & Conditions. If you do not agree, please do not use the Service.</P>

      <H2>2. What Mụta Igbo Is</H2>
      <P>Mụta Igbo is an educational language-learning service that helps children learn Igbo. It focuses on Central Igbo and offers kid-friendly lessons, games, stories, quizzes, and practice activities, available on the web and, where offered, as a mobile app.</P>

      <H2>3. Free Access</H2>
      <P>Mụta Igbo is currently free to use while we continue to build and improve it. All available learning content is unlocked. Features, content, and availability may change. If we introduce paid plans in the future, we will tell you clearly before any charge is made, and you will not be charged without your agreement.</P>

      <H2>4. Parent Accounts and Consent</H2>
      <P>Mụta Igbo is intended for children aged 3 and above, used under the supervision of a parent or legal guardian. Only a parent or legal guardian may create an account. Children do not create accounts or sign in on their own. By creating an account you confirm that you have the authority to agree to these Terms and to our Privacy Policy on behalf of the children whose profiles you add.</P>

      <H2>5. Your Account and Child Profiles</H2>
      <P>You can sign in with Google or with an email address and password. You are responsible for keeping your sign-in details secure and for activity under your account. Child profiles are created and managed by you inside your account. Profile names, avatar choices, and learning progress (such as streaks, words learned, quiz scores, and lesson progress) are saved to your account so they can follow you across devices. We recommend using a first name or nickname for each child rather than a full name.</P>
      <P>You can download a copy of your data, sign out, or permanently delete your account at any time from the Parent Center.</P>

      <H2>6. Future Paid Plans</H2>
      <P>We may offer paid plans, subscriptions, or purchases in the future. If we do, pricing, renewal terms, cancellation rules, and refund information will be shown clearly before any purchase. Payments would be handled by a third-party payment provider (and, in mobile apps, by the Apple App Store or Google Play). We would not receive or store your full payment card details.</P>

      <H2>7. Permitted Use</H2>
      <P>You may use the Service for personal, non-commercial family learning. You may not:</P>
      <Li>Copy, resell, redistribute, or commercially exploit Service content without permission</Li>
      <Li>Attempt to reverse engineer, scrape, or extract protected content, audio, or illustrations</Li>
      <Li>Interfere with, overload, or attempt to gain unauthorized access to the Service or other users' accounts</Li>
      <Li>Use the Service in a way that violates applicable laws or regulations</Li>

      <H2>8. Intellectual Property</H2>
      <P>All content in Mụta Igbo, including lesson data, vocabulary, illustrations, sounds, audio recordings, stories, design, branding, and the Mụta Igbo name, belongs to Mụta Igbo and its contributors. Igbo language content is prepared with cultural respect and care.</P>

      <H2>9. Accuracy of Language Content</H2>
      <P>We make reasonable efforts to provide accurate Igbo learning content. Igbo is a tonal language with dialectal variation, and the Service primarily teaches Central Igbo. We do not claim to represent every regional variation. If you notice an issue, contact us at content@mutaigbo.app.</P>

      <H2>10. Availability and Disclaimer</H2>
      <P>The Service is provided "as is" and "as available". We do not guarantee that it will be uninterrupted, error-free, or free from technical issues, and we do not guarantee specific educational outcomes.</P>

      <H2>11. Limitation of Liability</H2>
      <P>To the fullest extent permitted by law, Mụta Igbo is not liable for indirect, incidental, special, or consequential damages arising from your use of the Service, including loss of progress data. We work to keep your data safe, but we recommend downloading a copy of your data from the Parent Center from time to time.</P>

      <H2>12. Ending Your Use</H2>
      <P>You may stop using the Service and delete your account at any time. We may suspend or end access for accounts that break these Terms or put the Service or other families at risk. We may also change or discontinue the Service; where reasonably possible we will give notice and a chance to download your data first.</P>

      <H2>13. Changes to These Terms</H2>
      <P>We may update these Terms from time to time. For material changes we will notify you in the Service or by email before they take effect where appropriate. Continued use after changes means you accept the updated Terms.</P>

      <H2>14. Contact Us</H2>
      <P>For questions about these Terms, contact us at legal@mutaigbo.app.</P>
    </LegalScreen>
  );
}

// ─── PRIVACY POLICY ───────────────────────────────────────────────────────────
export function PrivacyScreen({ onBack }: { onBack: () => void }) {
  return (
    <LegalScreen title="Privacy Policy" onBack={onBack}>
      <H2>Our Commitment</H2>
      <P>Mụta Igbo is a children's educational service. We collect only what we need to run it, we never sell data, and we do not show ads. This policy explains what we collect, why, who handles it, and the choices you have.</P>

      <H2>Who This Policy Is For</H2>
      <P>Mụta Igbo is used by children under the supervision of a parent or legal guardian. Only a parent or guardian creates an account; children never create accounts or sign in themselves. This policy is addressed to parents and guardians.</P>

      <H2>What We Collect</H2>
      <P>Parent account:</P>
      <Li>Your email address, which you provide when you sign up with email, or which Google shares with us if you choose "Continue with Google". Google may also share basic profile details such as your name and picture; our sign-in provider stores them with your account, but we do not use them.</Li>
      <Li>A password, if you sign up with email and password. Passwords are stored in hashed form by our authentication provider; we cannot read them.</Li>
      <P>Child profiles (entered by you):</P>
      <Li>A first name or nickname, the learning friend (avatar) you choose, and your sound settings and daily goal.</Li>
      <Li>Learning progress: lesson progress, streaks, words learned, quiz scores, and recently opened lessons and activities.</Li>
      <P>Usage information:</P>
      <Li>Simple usage events such as signing in, starting a session, lesson progress, quiz results, and completing an activity. These are linked to your account (by an internal account ID, not by a child's name), include details like a lesson number or a score, and never include a child's name or any text a child types.</Li>
      <Li>Standard technical data our web host receives when you visit, such as IP address, browser type, and timestamps, used to deliver and secure the Service.</Li>
      <P>We do not ask children for their contact details, location, photos, or voice. We do not collect advertising identifiers.</P>

      <H2>How We Use It</H2>
      <Li>To sign you in and keep your children's profiles and progress safe and available on your devices</Li>
      <Li>To show progress in the Parent Center and personalize lessons within the app</Li>
      <Li>To understand how the Service is used, which lessons and games are popular, and where to improve</Li>
      <Li>To protect the Service, prevent misuse, and fix problems</Li>
      <P>We do not use your data for advertising, and we do not build advertising profiles.</P>

      <H2>On Your Device</H2>
      <P>Your browser or device keeps your sign-in session and a copy of your children's progress so the app works smoothly. We do not use cookies or similar technologies for advertising.</P>

      <H2>Who Handles Your Data</H2>
      <P>We use trusted service providers to run Mụta Igbo: Supabase for sign-in and for storing account and progress data, our web hosting provider to deliver the website, and Google if you choose to sign in with Google. They process data only to provide those services to us. We do not sell, rent, or share your data with advertisers or data brokers. We may disclose information if the law requires it or to protect the safety of families and the Service. Your data may be processed in countries other than your own.</P>

      <H2>Children's Privacy</H2>
      <P>Children use Mụta Igbo only through a parent's account, and a parent chooses what information is entered for each child. We do not knowingly collect personal information directly from children. By creating an account you confirm you are a parent or guardian and consent to the collection and use of your child's profile and progress information as described here. You can review, change, or delete it at any time. If you believe a child has created an account on their own, contact us and we will delete it.</P>

      <H2>Audio and Sound Features</H2>
      <P>The Service plays bundled sound effects and native-speaker pronunciation recordings as learning content. These are not recordings of your child. The "Say It Back" activity does not record, store, or transmit any audio, and the Service does not ask for microphone access. If we add voice features in the future, we will explain them clearly and update this policy first.</P>

      <H2>Payments</H2>
      <P>Mụta Igbo is currently free and we do not collect payment information. If we introduce paid plans, payments will be handled by a third-party payment provider and we will update this policy before then.</P>

      <H2>Keeping Data Safe</H2>
      <P>Data is sent over encrypted connections, and our systems are set up so that each account can access only its own information. No online service can promise perfect security, so please use a strong, unique password and tell us right away if you suspect a problem.</P>

      <H2>How Long We Keep It</H2>
      <P>We keep your account information and your children's profiles and progress for as long as your account exists. If you delete your account, we delete your account, child profiles, progress, and usage events from our live systems. Copies in our providers' backups may remain for a limited time before they are overwritten.</P>

      <H2>Your Choices and Rights</H2>
      <Li>Download a copy of your data: Parent Center, then "Download my data"</Li>
      <Li>Edit or remove a child profile: Parent Center, then "Child profiles"</Li>
      <Li>Reset all progress: Parent Center, then "Reset all progress"</Li>
      <Li>Delete your account and everything in it: Parent Center, then "Delete account"</Li>
      <P>Depending on where you live, you may have additional rights, such as to access, correct, or delete your information, or to object to or restrict certain processing. To use a right you cannot exercise in the app, contact us at the address below.</P>

      <H2>Changes to This Policy</H2>
      <P>We may update this policy as the Service changes. If a change is material, we will tell you in the Service or by email before it takes effect, and where the law requires it we will ask for your consent again.</P>

      <H2>Contact Us</H2>
      <P>For privacy questions or requests, contact us at privacy@mutaigbo.app.</P>
    </LegalScreen>
  );
}

// ─── BETA ACCESS TERMS ────────────────────────────────────────────────────────
export function SubscriptionTermsScreen({ onBack }: { onBack: () => void }) {
  return (
    <LegalScreen title="Beta Access Terms" onBack={onBack}>
      <H2>Current Free Beta</H2>
      <P>The current version of Mụta Igbo is available as a free beta. During this beta period, all available lessons, games, stories, quizzes, and practice activities are unlocked for family testing and feedback.</P>

      <H2>No Current Paid Subscription</H2>
      <P>This build does not currently charge users, sell a paid subscription, or process in-app purchases. There is no monthly or yearly plan active in the current beta version.</P>

      <H2>Future Paid Features</H2>
      <P>Mụta Igbo is subscription-ready, and we may introduce paid plans, subscriptions, or in-app purchases in a future version. If paid access is introduced, pricing, renewal terms, cancellation rules, and refund information will be clearly shown before any purchase is made.</P>

      <H2>App Store Processing</H2>
      <P>If future paid purchases are offered, they will be processed through the Apple App Store or Google Play Store. Mụta Igbo will not directly receive, store, or process payment card details.</P>

      <H2>Family Use</H2>
      <P>Current beta access is intended for personal family learning on your device. Future paid access terms may define household, profile, or platform family-sharing rules.</P>

      <H2>Contact Us</H2>
      <P>For questions about beta access or future subscriptions, contact us at support@mutaigbo.app.</P>
    </LegalScreen>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFF8E7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#DDF6FF',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(49, 189, 237, 0.22)',
    paddingVertical: 18,
    paddingHorizontal: SPACE.lg,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFF1B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 22,
    color: '#1B2A6B',
    fontWeight: '900',
  },
  headerTitle: {
    fontSize: FONT.lg,
    fontWeight: '900',
    color: '#1B2A6B',
    flex: 1,
  },
  scroll: {
    padding: SPACE.lg,
    paddingBottom: 160,
  },
  h2: {
    fontSize: FONT.md,
    fontWeight: '900',
    color: '#7A45D8',
    marginTop: SPACE.lg,
    marginBottom: SPACE.xs,
  },
  p: {
    fontSize: FONT.md,
    color: COLOR.textPrimary,
    lineHeight: 24,
    marginBottom: SPACE.sm,
  },
  li: {
    fontSize: FONT.md,
    color: COLOR.textPrimary,
    lineHeight: 24,
    marginBottom: 6,
    paddingLeft: SPACE.sm,
  },
  updated: {
    fontSize: FONT.xs,
    color: COLOR.textHint,
    textAlign: 'center',
    marginTop: SPACE.xl,
  },
});
