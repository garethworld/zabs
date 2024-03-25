module.exports = {
  content: [
    './layout/*.liquid',
    './templates/*.liquid',
    './templates/customers/*.liquid',
    './sections/*.liquid',
    './snippets/*.liquid',
  ],
  theme: {
    screens: {
      sm: '320px',
      md: '750px',
      lg: '990px',
      xlg: '1440px',
      x2lg: '1920px',
      pageMaxWidth: '1440px',
    },
    extend: {
      fontFamily: {
        heading: 'var(--font-heading-family)',
      },
    },
    colors: {
      tint1: "#000",
      tint2: "#fff",
      tint3: "#9e9d9b",
      tint4: "pink",
      tint5: "#666",
      tint7: "#fff",
    },
  },
  plugins: [],
};
