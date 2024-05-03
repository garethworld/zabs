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
      lg: '1300px',
    },

    fontFamily: {
      1: ['font-1', 'Arial', 'sans-serif'],
      2: ['font-2', 'Arial', 'sans-serif'],
      3: ['font-3', 'Arial', 'sans-serif'],
      4: ['font-4', 'Arial', 'sans-serif'],
      5: ['font-5', 'Arial', 'sans-serif'],
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
      31: '155px',
      32: '160px',
      33: '165px',
      34: '170px',
      35: '175px',
      36: '180px',
      37: '185px',
      38: '190px',
      39: '195px',
      40: '200px',
    },
    maxWidth: {
      content: '1000px',
      form: '800px',
      header: '600px',
    },
    colors: {
      none: 'transparent',
      tint1: '#053C96',
      tint2: '#FDF9E8',
      tint3: '#B71923',
      tint4: '#000',
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
          min: '13px',
          max: '14px',
          minvw: '375px',
          maxvw: '1400px',
        },
        2: {
          min: '13px',
          max: '15px',
          minvw: '375px',
          maxvw: '1400px',
        },
        3: {
          min: '13px',
          max: '16px',
          minvw: '375px',
          maxvw: '1400px',
        },
        4: {
          min: '14px',
          max: '19px',
          minvw: '375px',
          maxvw: '1400px',
        },
        5: {
          min: '16px',
          max: '21px',
          minvw: '375px',
          maxvw: '1400px',
        },
        6: {
          min: '17px',
          max: '23px',
          minvw: '375px',
          maxvw: '1400px',
        },
        7: {
          min: '24px',
          max: '30px',
          minvw: '375px',
          maxvw: '1400px',
        },
        8: {
          min: '25px',
          max: '37px',
          minvw: '375px',
          maxvw: '1400px',
        },
        9: {
          min: '34px',
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
          min: '29px',
          max: '50px',
          minvw: '375px',
          maxvw: '1400px',
        },
        13: {
          min: '32px',
          max: '60px',
          minvw: '375px',
          maxvw: '1400px',
        },
        14: {
          min: '40px',
          max: '81px',
          minvw: '375px',
          maxvw: '1400px',
        },
        15: {
          min: '9px',
          max: '11px',
          minvw: '375px',
          maxvw: '1400px',
        },
        16: {
          min: '50px',
          max: '87px',
          minvw: '375px',
          maxvw: '1400px',
        },
        17: {
          min: '60px',
          max: '109px',
          minvw: '375px',
          maxvw: '1400px',
        },
        18: {
          min: '14px',
          max: '16px',
          minvw: '375px',
          maxvw: '1400px',
        },
      },
    }),
  ],
};
