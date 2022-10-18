import { main } from './main'

describe('main', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('has a config interface', () => {
    expect(main()).toMatchObject({ prettier: {} })
  })

  it('has prettier config keys', () => {
    const { prettier } = main()

    prettier.arrowParens = 'always'
    prettier.bracketSameLine = true

    expect(prettier).toEqual({
      arrowParens: 'always',
      bracketSameLine: true,
    })
  })
})
