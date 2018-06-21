import React, { Component } from 'react'
import Settings from '../settings.js'
let { text, title, workingArea } = Settings

// We don't export this, it applies to all text definitions below
// removes paddings & padding
const TextAll = props => {
  return (
    <p style={{margin: 0, padding: 0, ...props.style}}>
      {props.children}
    </p>
  )
}

// Exports
export const View = props => (
  <div {...props}>
    {props.children}
  </div>
)

export const Text = props => {
  return (
    <TextAll {...props} style={{...text}}>
      {props.children}
    </TextAll>
  )
}

export const Title = props => {
  return (
    <TextAll style={{...title, ...props.style}}>
      {props.children}
    </TextAll>
  )
}

export const WorkingArea = props => {
  return (
    <View style={{...workingArea, ...props.style}}>
      {props.children}
    </View>
  )
}

export class Terminal extends Component {
  componentDidMount() {
    // this.input.focus()
  }
  render() {
    const { props } = this
    return (
      <View {...props}>
        <View style={{
            width: 400,
            height: 500,
            borderRadius: 30,
            backgroundColor: '#610c30',
            display: 'flex',
            padding: 20,
          }}>
          {/* <input
            ref={input => {this.input = input}}
            type="text"
            style={{
              justifyContent: 'center',
              alignSelf: 'flex-end',
              width: '100%',
            }}/>*/}
        </View>
      </View>
    )
  }
}
