function mainComponent (e, component) {
    return e('div', component.state.active && { style: expandedWindow },
        e('button', {
            style: squareButtonStyle,
            onClick: () => component.onActivate()
        },
        e('text', { style: textStyle.L },
            component.state.active ? '-' : '+'
        )
        ),
        e('div', !component.state.active && { style: { display: 'none' } },
            renderTabComponents(e, component),
            renderWindowComponents(e, component),
            readWriteComponents(e, component)
        )
    )
}

function renderTabComponents (e, component) {
    return e('div', { style: tabHeaderStyle },
        Object.keys(
            commandDataTypes
        ).map(command => {
            return e('div', null,
                renderTab(command, e, component)
            )
        })
    )
}

function renderTab (tab, e, component) {
    return e('button', {
        style: {
            ...tabButtonStyle,
            backgroundColor:
                component.state.activeTab === tab
                    ? colorTheme.lightgray1
                    : colorTheme.darkgray1
        },
        onClick: () => component.onChangeTab(tab)
    }, e('text', { style: textStyle.S }, commandDataTypes[tab].displayName))
}

function renderWindowComponents (e, component) {
    return renderWindow(
        component.state.triggerData[component.state.activeTab], e, component
    )
}

function renderWindow (data, e, component) {
    return e('div', null,
        renderSmoothTab(data, e, component),
        e('div', { style: triggerWindowStyle },
            Object.keys(data.triggers).map(i => {
                return renderTrigger(data.id, parseInt(i), data.triggers[i], e, component)
            }),
            e('button', {
                style: {
                    ...squareButtonStyle,
                    position: 'relative',
                    right: '10px',
                    bottom: '4.5px'
                },
                onClick: () => component.createTrigger()
            },
            e('text', {
                style: {
                    ...textStyle.L,
                    fontWeight: 900
                }
            }, '+')
            )
        )
    )
}

function renderSmoothTab (data, e, component) {
    return e('div', { style: smoothTabStyle },
        e('text', { style: textStyle.S }, 'Smoothing'),
        data.id !== Triggers.TimeRemap && e('input', {
            style: {
                ...smoothTextInputStyle,
                marginLeft: '5px'
            },
            value: data.smoothing,
            onChange: (event) => component.updateTrigger(
                event.target.value,
                ['smoothing'],
                constraintProps.smoothProps
            )
        }),
        data.id === Triggers.TimeRemap && e('div', { style: checkboxDivStyle },
            e('input', {
                style: checkboxStyle,
                type: 'checkbox',
                onChange: () => component.updateTrigger(
                    !component.state.data[component.state.activeTab].interpolate,
                    ['interpolate'],
                    constraintProps.interpolateProps
                )
            }),
            data.interpolate && e('square', { style: checkboxFillStyle })
        )
    )
}

function renderTrigger (type, index, data, e, component) {
    const tProps = [
        constraintProps.minuteProps,
        constraintProps.secondProps,
        constraintProps.frameProps
    ]

    return e('div', {
        style: {
            ...triggerStyle,
            backgroundColor: index === 0 ? colorTheme.gray : colorTheme.white
        }
    },
    e('div', { style: triggerDivStyle },
        e('text', {
            style: {
                ...textStyle.L,
                paddingRight: '10px'
            }
        }, parseInt(index) + 1),
        data[0].map((timeValue, timeIndex) => {
            return e('div', null,
                e('text', { style: triggerTextStyle },
                    ['TIME', ':', ':'][timeIndex]
                ),
                e('input', {
                    style: {
                        ...triggerTextStyle,
                        backgroundColor:
                            index === 0
                                ? colorTheme.darkgray2
                                : colorTheme.white
                    },
                    disabled: index === 0,
                    value: timeValue,
                    onChange: (event) => component.updateTrigger(
                        event.target.value,
                        ['triggers', index, 0, timeIndex],
                        tProps[timeIndex]
                    )
                })
            )
        }),
        e('button', {
            style: {
                ...squareButtonStyle,
                position: 'absolute',
                right: '10px'
            },
            disabled: index === 0,
            onClick: () => component.deleteTrigger(index)
        },
        e('text', {
            style: {
                ...textStyle.M,
                color: index === 0 ? colorTheme.darkgray2 : colorTheme.black,
                fontWeight: 900
            }
        }, 'X'))
    ),
    type === Triggers.Zoom && renderZoomLayout(data, index, e, component),
    type === Triggers.CameraPan && renderCameraPanLayout(data, index, e, component),
    type === Triggers.CameraFocus && renderCameraFocusLayout(data, index, e, component),
    type === Triggers.TimeRemap && renderTimeRemapLayout(data, index, e, component)
    )
}

function renderZoomLayout (data, index, e, component) {
    const label = 'ZOOM TO'

    return e('div', null,
        e('text', { style: triggerTextStyle }, label),
        e('input', {
            style: triggerTextStyle,
            value: data[1],
            onChange: (event) => component.updateTrigger(
                event.target.value,
                ['triggers', index, 1],
                constraintProps.zoomProps
            )
        })
    )
}

function renderCameraPanLayout (data, index, e, component) {
    const cProps = [
        constraintProps.wProps,
        constraintProps.hProps,
        constraintProps.xProps,
        constraintProps.yProps
    ]
    const labels = ['WIDTH', 'HEIGHT', 'X OFFSET', 'Y OFFSET']

    return e('div', null,
        Object.keys(data[1]).map((prop, propIndex) => {
            return e('div', {
                style: {
                    alignItems: 'center',
                    display: 'inline-block'
                }
            },
            e('text', { style: triggerTextStyle }, labels[propIndex]),
            e('input', {
                style: triggerTextStyle,
                value: data[1][prop],
                onChange: (event) => component.updateTrigger(
                    event.target.value,
                    ['triggers', index, 1, prop],
                    cProps[propIndex]
                )
            })
            )
        })
    )
}

function renderCameraFocusLayout (data, index, e, component) {
    const dropdownIndex = component.state.focuserDropdowns[index]

    return e('div', null,
        e('select', {
            style: dropdownHeaderStyle,
            value: dropdownIndex,
            onChange: (event) => component.onChangeDropdown(
                index, event.target.value
            )
        },
        Object.keys(data[1]).map(riderIndex => {
            const riderNum = 1 + parseInt(riderIndex)

            return e('option', {
                style: dropdownOptionStyle,
                value: parseInt(riderIndex)
            }, e('text', null, `Rider ${riderNum}`))
        })),
        e('text', { style: triggerTextStyle }, 'WEIGHT'),
        e('input', {
            style: triggerTextStyle,
            value: data[1][dropdownIndex],
            onChange: (event) => component.updateTrigger(
                event.target.value,
                ['triggers', index, 1, dropdownIndex],
                constraintProps.fWeightProps
            )
        })
    )
}

function renderTimeRemapLayout (data, index, e, component) {
    const label = 'TIME SCALE'

    return e('div', null,
        e('text', { style: triggerTextStyle }, label),
        e('input', {
            style: triggerTextStyle,
            value: data[1],
            onChange: (event) => component.updateTrigger(
                event.target.value,
                ['triggers', index, 1],
                constraintProps.timeProps
            )
        })
    )
}

function readWriteComponents (e, component) {
    return e('div', null,
        e('button', {
            style: {
                ...readWriteButtonStyle,
                left: '18px'
            },
            onClick: () => component.onRead()
        },
        e('text', { style: textStyle.M }, 'Read')
        ),
        e('button', {
            style: {
                ...readWriteButtonStyle,
                right: '18px'
            },
            onClick: () => component.onCommit()
        },
        e('text', { style: textStyle.M }, 'Commit')
        ),
        e('div', { style: errorContainerStyle },
            e('text', {
                style: {
                    ...textStyle.M,
                    color: component.state.hasError ? 'Red' : 'Black'
                }
            }, component.state.errorMessage)
        )
    )
}
