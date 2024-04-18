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
      md: '900px',
      lg: '1200px',
    },

    fontFamily: {
      1: ['font-1', 'Arial', 'sans-serif'],
      2: ['font-2', 'Arial', 'sans-serif'],
      3: ['font-3', 'Arial', 'sans-serif'],
      4: ['font-4', 'Arial', 'sans-serif'],
    },
    fontSize: {
      1: ['11px', '13px'],
      2: ['12px', '16px'],
      3: ['13px', '13px'],
      4: ['14px', '16px'],
      5: ['15px', '17px'],
    },
    borderWidth: {
      1: '1px',
      2: '2px',
      3: '3px',
      4: '4px',
      5: '5px',
      6: '6px',
    },
    lineHeight: {
      1: '100%',
      2: '110%',
      3: '120%',
      4: '130%',
      5: '140%',
    },
    spacing: {
      0: '0',
      1: '5px',
      2: '10px',
      3: '15px',
      4: '20px',
      5: '25px',
      6: '30px',
      7: '35px',
      8: '40px',
      9: '45px',
      10: '50px',
      11: '55px',
      12: '60px',
      13: '65px',
      14: '70px',
      15: '75px',
      16: '80px',
      17: '85px',
      18: '90px',
      19: '95px',
      20: '100px',
      21: '105px',
      22: '110px',
      23: '115px',
      24: '120px',
      25: '125px',
      26: '130px',
      27: '135px',
      28: '140px',
      29: '145px',
      30: '150px',
    },
    maxWidth: {
      content: '1000px',
    },
    colors: {
      tint1: '#053C96',
      tint2: '#FDF9E8',
      tint3: '#B71923',
    },
    borderRadius: {
      1: '13px',
      2: '21px',
    },
  },
  plugins: [
    require('tailwindcss-fluid')({
      textSizes: {
        1: {
          min: '14px',
          max: '14px',
          minvw: '375px',
          maxvw: '1400px',
        },
        2: {
          min: '15px',
          max: '15px',
          minvw: '375px',
          maxvw: '1400px',
        },
        3: {
          min: '16px',
          max: '16px',
          minvw: '375px',
          maxvw: '1400px',
        },
        4: {
          min: '19px',
          max: '19px',
          minvw: '375px',
          maxvw: '1400px',
        },
        5: {
          min: '21px',
          max: '21px',
          minvw: '375px',
          maxvw: '1400px',
        },
        6: {
          min: '23px',
          max: '23px',
          minvw: '375px',
          maxvw: '1400px',
        },
        7: {
          min: '30px',
          max: '30px',
          minvw: '375px',
          maxvw: '1400px',
        },
        8: {
          min: '37px',
          max: '37px',
          minvw: '375px',
          maxvw: '1400px',
        },
        9: {
          min: '41px',
          max: '41px',
          minvw: '375px',
          maxvw: '1400px',
        },
        10: {
          min: '43px',
          max: '43px',
          minvw: '375px',
          maxvw: '1400px',
        },
        11: {
          min: '43px',
          max: '43px',
          minvw: '375px',
          maxvw: '1400px',
        },
        12: {
          min: '50px',
          max: '50px',
          minvw: '375px',
          maxvw: '1400px',
        },
        13: {
          min: '60px',
          max: '60px',
          minvw: '375px',
          maxvw: '1400px',
        },
      },
    }),
  ],
};
