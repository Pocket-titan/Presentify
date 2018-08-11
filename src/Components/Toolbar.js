import React, { Component, PureComponent } from 'react'
import styled from 'styled-components'
import { Icon } from './'

const StyledBar = styled.div`
  position: absolute;
  height: 60px;
  width: 100%;
  background-color: rgb(48, 48, 48);
  bottom: -10px;
  border-top: 1px solid rgb(80, 80, 80);
  align-items: center;
  justify-content: center;
  display: flex;
`

const StyledIcon = styled(Icon)`
  cursor: pointer;
  color: white;
  font-size: 20px !important;
  margin-left: 15px;
  margin-right: 15px;
  opacity: ${props => props.selected ? 1 : 0.7};
  transition: opacity 200ms ease-in-out;
  :hover {
    opacity: 1;
  }
`

const StyledColor = styled.div`
  cursor: pointer;
  width: 18px;
  height: 18px;
  border-radius: 20px;
  background-color: ${props => props.color};
  margin-left: ${props => (props.style && props.style.marginLeft) || 0}px;
  margin-right: ${props => (props.style && props.style.marginRight) || 0}px;
`

const MoreColors = styled.div`
  position: absolute;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px;
  background-color: rgb(80, 80, 80);
  bottom: 60px;
  border-radius: 12px;
  margin-left: 15px;
  border: 1px solid rgb(100, 100, 100);
`

class ColorPicker extends PureComponent {
  state = {
    displayMoreColors: false,
  }

  toggleDisplayMoreColors = () => {
    this.setState(prevState => ({ displayMoreColors: !prevState.displayMoreColors }))
  }

  render() {
    const { props } = this
    const colors = [
      "#2980b9",
      "#f39c12",
      "#c0392b",
      "#1abc9c",
      "#9b59b6",
    ]
    return (
      <React.Fragment>
        <StyledColor
          {...props}
          onClick={this.toggleDisplayMoreColors}
          style={{marginRight: 15, marginLeft: 15, border: '1px solid rgb(200, 200, 200)'}}
        />
        {this.state.displayMoreColors && (
            <MoreColors>
              {colors.map((color, i) => (
                <StyledColor
                  color={color}
                  key={color}
                  style={ i < colors.length - 1 ? { marginRight: 5 } : {} }
                  onClick={() => {
                    props.setColor(color), this.toggleDisplayMoreColors()
                  }}
                />
              ))}
            </MoreColors>
          )}
      </React.Fragment>
    )
  }
}

class Toolbar extends Component {
  render() {
    const { props } = this
    const ToolbarIcon = props => (
      <StyledIcon
        {...props}
        selected={props.tool === this.props.currentTool}
        onClick={() => this.props.setProperty('tool')(props.tool)}
      />
    )
    return (
      <StyledBar>
        <ToolbarIcon name="fa fa-pencil" tool='pencil'/>
        <ToolbarIcon name="fa fa-font" tool='text'/>
        <ToolbarIcon name="fa fa-eraser" tool='font'/>
        <ColorPicker
          color={props.color}
          setColor={props.setProperty('color')}
        />
      </StyledBar>
    )
  }
}

export default Toolbar
