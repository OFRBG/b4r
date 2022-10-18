import { main } from './main'

describe('main', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('has prettier config keys', () => {
    const { prettier } = main

    prettier.arrowParens = 'always'
    prettier.bracketSameLine = true

    expect(prettier).toEqual({
      $schema: expect.any(String),
      arrowParens: 'always',
      bracketSameLine: true,
    })
  })
})
