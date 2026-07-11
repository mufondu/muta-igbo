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
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {children}
        <Text style={s.updated}>Last updated: July 2026</Text>
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
      <P>By downloading, installing, or using Mụta Igbo ("the App"), you confirm that you are a parent or legal guardian and that you agree to these Terms & Conditions. If you do not agree, please do not use the App.</P>

      <H2>2. Description of the App</H2>
      <P>Mụta Igbo is an educational language learning app designed to help children learn Igbo. The App focuses on Central Igbo as its primary teaching language. Learning content is organized into kid-friendly lessons, games, stories, quizzes, and practice activities.</P>

      <H2>3. Current Free Beta Access</H2>
      <P>The current version of the App is available as a free beta. During this beta period, all available learning content is unlocked for testing and family feedback. There is no active paid subscription or in-app purchase flow in this build.</P>

      <H2>4. Eligibility and Parental Consent</H2>
      <P>The App is intended for children aged 3 and above under the supervision of a parent or legal guardian. A parent or legal guardian must set up and manage child profiles, app settings, and any future account or purchase-related decisions.</P>

      <H2>5. User Profiles and Local Progress</H2>
      <P>The App does not require an online account. Child profiles and learning progress are stored locally on your device. This may include profile names, avatar choices, streaks, words learned, quiz scores, and lesson progress. We are not responsible for locally stored progress that is lost because of device loss, factory reset, or uninstalling the App.</P>

      <H2>6. Future Purchases</H2>
      <P>Mụta Igbo is designed to be subscription-ready, and we may introduce paid plans, subscriptions, or in-app purchases in a future version. If paid access is introduced, pricing and purchase terms will be clearly presented before any charge is made. Future purchases would be processed by the Apple App Store or Google Play Store. We do not directly process or store payment information.</P>

      <H2>7. Permitted Use</H2>
      <P>You may use the App for personal, non-commercial family learning. You may not:</P>
      <Li>Copy, resell, redistribute, or commercially exploit App content without permission</Li>
      <Li>Attempt to reverse engineer, decompile, or extract protected App assets</Li>
      <Li>Use the App in a way that violates applicable laws or regulations</Li>
      <Li>Misuse beta access, future paid access, or App content outside normal family learning use</Li>

      <H2>8. Intellectual Property</H2>
      <P>All content in Mụta Igbo, including lesson data, vocabulary, illustrations, sounds, audio recordings, stories, app design, branding, and the App name, belongs to Mụta Igbo and its contributors. Igbo language content is prepared with cultural respect and care.</P>

      <H2>9. Accuracy of Language Content</H2>
      <P>We make reasonable efforts to provide accurate Igbo learning content. Igbo is a tonal language with dialectal variation, and this App primarily teaches Central Igbo. We do not claim to represent every regional variation. If you notice an issue, contact us at content@mutaigbo.app.</P>

      <H2>10. Disclaimer</H2>
      <P>The App is provided on an "as is" basis. We do not guarantee that the App will always be uninterrupted, error-free, or free from technical issues. We also do not guarantee specific educational outcomes.</P>

      <H2>11. Limitation of Liability</H2>
      <P>To the fullest extent permitted by law, Mụta Igbo is not liable for indirect, incidental, special, or consequential damages arising from your use of the App, including loss of locally stored progress data.</P>

      <H2>12. Changes to These Terms</H2>
      <P>We may update these Terms from time to time. Material changes will be communicated through the App or app store listing where appropriate. Continued use of the App after changes means you accept the updated Terms.</P>

      <H2>13. Contact Us</H2>
      <P>For questions about these Terms, contact us at legal@mutaigbo.app.</P>
    </LegalScreen>
  );
}

// ─── PRIVACY POLICY ───────────────────────────────────────────────────────────
export function PrivacyScreen({ onBack }: { onBack: () => void }) {
  return (
    <LegalScreen title="Privacy Policy" onBack={onBack}>
      <H2>Our Commitment to Privacy</H2>
      <P>Mụta Igbo is a children's educational app. We design the App to collect as little data as possible and to keep children's learning activity local to the device.</P>

      <H2>Who This Policy Applies To</H2>
      <P>This policy applies to parents, guardians, and children who use Mụta Igbo under adult supervision.</P>

      <H2>What Data We Collect</H2>
      <P>The current version of the App does not collect personal information from children. Specifically:</P>
      <Li>We do not require online account creation</Li>
      <Li>We do not collect email addresses, phone numbers, precise location, or advertising identifiers</Li>
      <Li>We do not use advertising networks or third-party ad trackers</Li>
      <Li>We do not sell, rent, or share user data</Li>

      <H2>Local Device Data</H2>
      <P>The App stores learning data locally on your device using local storage. This may include child profile names, avatar choices, learning progress, quiz scores, streaks, sound settings, and haptic settings. This data does not leave your device through Mụta Igbo unless a future version clearly introduces an online feature and this policy is updated.</P>

      <H2>Children's Privacy</H2>
      <P>We do not knowingly collect personal information from children under 13. The App is structured so a parent or guardian manages child profiles and settings. No child is asked to provide personal contact information.</P>

      <H2>Audio and Sound Features</H2>
      <P>The App includes bundled sound effects and may include native-speaker pronunciation recordings as learning content. These are App assets, not recordings of the child or parent. The current "Say It Back" experience is a demo/practice feature and does not record, store, or transmit user audio. If future versions introduce user voice recording or pronunciation analysis, the feature will be clearly explained and this policy will be updated before release.</P>

      <H2>Payments</H2>
      <P>The current free beta build does not charge users and does not include an active paid subscription flow. We do not receive, store, or process payment details. If paid plans or in-app purchases are introduced later, payments will be handled by the Apple App Store or Google Play Store and this policy will be updated as needed.</P>

      <H2>Analytics and Crash Reporting</H2>
      <P>The current version does not use analytics or crash reporting services that transmit personal data externally. We may introduce privacy-preserving diagnostics or aggregate analytics in a future version to improve app quality. If that happens, this policy will be updated before release.</P>

      <H2>Data Sharing</H2>
      <P>We do not sell, rent, share, or disclose user data to advertisers, data brokers, or advertising partners.</P>

      <H2>Data Retention and Deletion</H2>
      <P>Because learning data is stored locally, you can remove it by using the App's reset option or by uninstalling the App. Uninstalling the App removes locally stored App data from the device, subject to your operating system's backup behavior.</P>

      <H2>Security</H2>
      <P>We use reasonable development practices to protect the integrity of locally stored App data. Because no online account is required in the current version, there is no remote Mụta Igbo account database containing children's personal information.</P>

      <H2>Your Rights</H2>
      <P>As a parent or guardian, you can review, manage, or delete locally stored child profile and progress data directly in the App.</P>

      <H2>Changes to This Policy</H2>
      <P>We may update this Privacy Policy periodically. Material changes will be communicated through the App or app store listing where appropriate.</P>

      <H2>Contact Us</H2>
      <P>For privacy questions, contact us at privacy@mutaigbo.app.</P>
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
