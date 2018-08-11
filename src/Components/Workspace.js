import React, { Component } from 'react'
import Blackboard from './Blackboard'
import Toolbar from './Toolbar'
import 'font-awesome/css/font-awesome.min.css'

class Workspace extends Component {
  state = {
    tool: 'pencil',
    color: '#2980b9',
    brushWidth: 5,
  }

  setProperty = property => value => {
    if (this.state[property] === value) return
    this.setState({ [property]: value })
  }

  render() {
    const { tool, color, brushWidth } = this.state
    return (
      <div style={{width: '100%', height: '100%'}}>
        <Blackboard tool={tool} color={color} brushWidth={brushWidth}/>
        <Toolbar setProperty={this.setProperty} color={color} currentTool={tool}/>
      </div>
    )
  }
}

export default Workspace
