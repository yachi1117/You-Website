import ReactGA from 'react-ga4';

// 初始化 GA4
export const initGA = (measurementId) => {
  ReactGA.initialize(measurementId);
};

// 追踪页面访问
export const logPageView = (title) => {
  ReactGA.send({ 
    hitType: "pageview", 
    page: window.location.pathname,
    title: title
  });
};

// 追踪页面停留时间
export const logPageTiming = (category, variable, value) => {
  ReactGA.send({
    hitType: "timing",
    timingCategory: category,
    timingVar: variable,
    timingValue: value
  });
};

// 追踪事件
export const logEvent = (category, action, label, value) => {
  ReactGA.event({
    category: category,
    action: action,
    label: label,
    value: value
  });
}; 