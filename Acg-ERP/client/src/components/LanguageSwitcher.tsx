import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const next = i18n.language === 'ar' ? 'en' : 'ar';
  const label = i18n.language === 'ar' ? 'EN' : 'ع';

  return (
    <button
      onClick={() => i18n.changeLanguage(next)}
      className="btn-secondary !px-3 !py-1.5"
      title="Change language"
    >
      <span className="font-semibold">{label}</span>
    </button>
  );
}
