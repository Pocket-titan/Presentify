/*
  BlackBoard:
    A large pannable, zoomable 'canvas' (but not <canvas/>) that can be drawn on,
    and can contain images, videos, etc.
*/
import React, { Component } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import testImgSrc from '../assets/Speld1.jpg'
/*
  On matrices:
  [
    x-n_new,
    y_new,
    1
  ] =
  [
    [a, c, e],
    [b. d. f],
    [0, 0, 1],
  ] * [
    x_old,
    y_old,
    1
  ] = [
    a*x_old + c*y_old + e,
    b*x_old + d*y_old + f,
    1
  ]
*/

const StyledBoard = styled.div`
  background-color: rgb(56, 56, 56);
  width: 100%;
  height: 100%;
`

// matrix : Obj -> TransformProperty<String>
const matrix = ({ a, b, c, d, e, f }) => {
  let value = { a, b, c, d, e, f }
  value.toString = () => `matrix(${a}, ${b}, ${c}, ${d}, ${e}, ${f})`
  return value
}

// Translational matrix
const translateMatrix = ({ deltaX, deltaY }) => (
  matrix({
    a: 1,
    b: 0,
    c: 0,
    d: 1,
    e: -1*deltaX,
    f: -1*deltaY
  })
)

// Rotational matrix
const rotateMatrix = ({ angle }) => matrix({
  a: Math.cos(angle),
  b: Math.sin(angle),
  c: -1*Math.sin(angle),
  d: Math.cos(angle),
  e: 0,
  f: 0,
})

// Scaling matrix
const scaleMatrix = ({
  centerX,
  centerY,
  scaleX,
  scaleY
}) => matrix({
  a: scaleX,
  b: 0,
  c: 0,
  d: scaleY,
  e: centerX - scaleX*centerX,
  f: centerY - scaleY*centerY,
})

// Method for multiplying two matrices
const multiply = (
  { a: a1, b: b1, c: c1, d: d1, e: e1, f: f1 },
  { a: a2, b: b2, c: c2, d: d2, e: e2, f: f2 }
) => (
  matrix({
    a: a1*a2 + b2*c1,
    b: a2*b1 + b2*d1,
    c: a1*c2 + c1*d2,
    d: b1*c2 + d1*d2,
    e: c1*f2 + e1 + a1*e2,
    f: f1 + d1*f2 + b1*e2,
  })
)

// Stroke component
const Stroke = ({ data, color, strokeWidth }) => {
  if (data.length === 0) {
    return null
  }

  const d = `
  M ${data[0].x} ${data[0].y}
  ${
    data
    .filter((c, i) => i > 0)
    .map((coords, i) => `L ${coords.x} ${coords.y}`)
  }
  `
  return (
    <path
      d={d}
      stroke={color}
      fill="transparent"
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  )
}

// Right now, Wrapper wraps non-svg objects with foreignObject so it can be rendered
// on the 100% size svg
// but in the future this will wrap in divs with style.transform prop!
// but first we need a global svg overlay that allows you to draw and render other stuff outside of it
class Wrapper extends Component {
  render() {
    const { props } = this
    return props.isSvg
      ? this._renderSvg()
      : this._renderForeign()
  }

  _renderForeign() {
    const { transform, children } = this.props
    return (
      <foreignObject style={{ transform: transform.toString() }}>
        {children}
      </foreignObject>
    )
  }

  _renderSvg() {
    const { transform, children } = this.props
    return (
      <g style={{ transform: transform.toString() }}>
        {children}
      </g>
    )
  }
}

const component_map = {
  'pencil': {
    name: 'pencil',
    Component: (child, i, transform) => <Stroke key={i} {...child}/>,
  },
  'image': {
    name: 'image',
    Component: (child, i, transform) => <Image key={i} {...child}/>,
  }
}

class Image extends Component {
  render() {
    const { props } = this
    return (
      <img
        src={props.src}
        style={{...props.style, userSelect: 'none', userDrag: 'none'}}
      />
    )
  }
}

/*
  Blackboard handles the drawing, but also has all the other types. Maybe change this? TODO
*/
class Blackboard extends Component {
  static propTypes = {
    tool: PropTypes.string.isRequired,
    brushWidth: PropTypes.number.isRequired,
    color: PropTypes.string.isRequired,
  }

  static defaultProps = {
    options: {
      minZoom: 4,
      maxZoom: 18,
      minX: -500,
      maxX: 500,
      minY: -500,
      maxY: 500,
    },
  }

  state = {
    children: [],
    drawing: false,
    currentId: -1,
    // canvasComponent
    scale: 1,
    translation: {
      x: 0,
      y: 0,
    },
    transform: matrix({
      a: 1,
      b: 0,
      c: 0,
      d: 1,
      e: 0,
      f: 0,
    }),
  }

  onMouseDown = e => {
    const { props } = this
    const newChild = {
      type: 'pencil',
      strokeWidth: 5,
      color: props.color,
      data: [],
    }
    this.setState(prevState => ({
      drawing: true,
      currentId: prevState.currentId + 1,
      children: [ ...prevState.children, newChild ]
    }))
  }

  onMouseMove = e => {
    const { drawing, currentId, translation, transform } = this.state
    if (drawing) {
      const newData = {
        x: e.clientX - transform.e,
        y: e.clientY - transform.f,
      }
      this.setState(prevState => ({
        children: prevState.children.map((child, i) => {
          if (child.type !== 'pencil') {
            return child
          }
          return i === currentId
            ? { ...child, data: [ ...child.data, newData ] }
            : child
        })
      }))
    }
  }

  onMouseUp = e => {
    this.setState({ drawing: false })
  }

  onWheel = e => {
    const { props } = this
    e.preventDefault()
    const { deltaX, deltaY, clientX, clientY,  } = e
    // helper function for making sure a number is whole
    const isWhole = number => number % 1 === 0
    // helper function for making sure a property fits certain bounds
    const boundedProperty = ({ property, bounds: { max, min } }) => (
      property >= max
        ? max
        : property <= min
          ? min
          : property
    )

    if (isWhole(deltaX) && isWhole(deltaY)) {
      // translation
      const { translation } = this.state

      const newTranslation = {
        x: boundedProperty({
          property: translation.x - deltaX,
          bounds: {
            max: props.options.maxX,
            min: props.options.minX,
          }
        }),
        y: boundedProperty({
          property: translation.y - deltaY,
          bounds: {
            max: props.options.maxY,
            min: props.options.minY,
          }
        }),
      }

      if (newTranslation !== translation) {
        this.setState(prevState => ({
          translation: newTranslation,
          transform: multiply(
            prevState.transform,
            translateMatrix({ deltaX, deltaY })
          )
        }))
      }
    } else {
      // zoom
      const { transform, translation, scale } = this.state

      const newScale = boundedProperty({
        property: (11 + -1/10*deltaY)/11,
        bounds: {
          max: 2,
          min: 0.25,
        }
      })

      if (newScale !== scale) {
        const scaleX = newScale
        const scaleY = newScale

        console.log('translation.x:', translation.x)
        this.setState(prevState => ({
          scale: newScale,
          transform: multiply(
            prevState.transform,
            scaleMatrix({
              scaleX, scaleY,
              centerX: clientX - translation.x,
              centerY: clientY - translation.y,
            })
          )
        }))
      }
    }
  }

  componentDidMount() {
    const testImg = {
      type: 'image',
      src: testImgSrc,
      style: {
        height: 150,
        width: 150,
      }
    }
    this.setState(prevState => ({
      children: [ ...prevState.children, testImg ]
    }))
  }

  render() {
    const { children, transform } = this.state
    const { props } = this
    return (
      <StyledBoard
        onMouseDown={this.onMouseDown}
        onMouseUp={this.onMouseUp}
        onMouseMove={this.onMouseMove}
        onWheel={this.onWheel}
      >
        <svg style={{ height: '100%', width: '100%' }} className="michiel-sorry-voor-de-svg">
        {
          children.map((child, i) =>
            child && (
              <Wrapper transform={transform} isSvg={child.type === 'pencil'}>
                {
                  component_map[child.type].Component(child, i)
                }
              </Wrapper>
            )
          )
        }
        </svg>
      </StyledBoard>
    )
  }
}

export default Blackboard
