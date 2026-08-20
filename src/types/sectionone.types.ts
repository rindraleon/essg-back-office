export type HeroAction = {
  readonly label: string;
  readonly to: string;
  readonly variant?: 'primary' | 'outline';
};

export type SectionOneProps = {
  readonly title?: string;
  readonly subtitle?: string;
  readonly actions?: ReadonlyArray<HeroAction>;
  readonly imageSrc?: string;
  readonly imageAlt?: string;
  readonly showTemplateNotice?: boolean;
};
