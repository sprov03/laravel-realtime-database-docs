module.exports = {
  title: 'Akceli',
  description: 'Akcelerate your Laravel development',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/'},
      { text: 'Akceli', link: 'https://akceli.io'},
      { text: 'Login', link: 'https://app.akceli.io/login'},
    ],
    sidebar: {
      '/guide/': [
        ['', 'Intro'],
        ['installation', 'Installation'],
        // ['config-doc', 'Configuration'],
        // ['relationship-builder-doc', 'Relationship Builder'],
        // ['generator-doc', 'Generators'],
        // ['template-doc', 'Templates'],
        // ['walk-through', 'Todo App Demo'],
      ],
    }
  },
  // Google Tag Manager for analytics
  head: [
    // ['script', {async: null ,src: "https://www.googletagmanager.com/gtag/js?id=UA-151006134-2"}],
    // ['script', {}, `
    //     window.dataLayer = window.dataLayer || [];
    //     function gtag(){dataLayer.push(arguments);}
    //     gtag('js', new Date());
    //     gtag('config', 'UA-151006134-2');
    // `]
  ],
};