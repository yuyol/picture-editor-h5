module.exports = {
    plugins: {
      'postcss-px-to-viewport': {
        viewportWidth: 375, // 设计稿宽度
        viewportHeight: 667, // 设计稿高度，可选
        unitPrecision: 3, // 转换精度
        viewportUnit: 'vw', // 转换成 vw 单位
        selectorBlackList: ['.ignore'], // 不需要转换的类名
        minPixelValue: 1, // 小于等于1px不转换
        mediaQuery: false, // 是否允许在媒体查询中转换
      },
    },
  };