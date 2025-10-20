/**
 * Babel Configuration
 *
 * Jest와 ES6 모듈 지원을 위한 Babel 설정
 *
 * @version 1.0.0
 * @date 2025-10-18
 */

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current'
        }
      }
    ],
    [
      '@babel/preset-react',
      {
        runtime: 'automatic'
      }
    ]
  ]
}
