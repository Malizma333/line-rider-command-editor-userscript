function mainComp (create, root) {
    return create('div', root.state.active && { style: expandedWindow },
        create('button', {
            style: squareButtonStyle,
            onClick: () => root.onActivate()
        },
        create('text', { style: textStyle.L },
            root.state.active ? '-' : '+'
        )
        ),
        create('div', !root.state.active && { style: { display: 'none' } },
            tabComps(create, root),
            windowComps(create, root),
            readWriteComps(create, root)
        )
    )
}

function tabComps (create, root) {
    return create('div', { style: tabHeaderStyle },
        Object.keys(
            commandDataTypes
        ).map(command => {
            return create('div', null,
                tabComp(create, root, command)
            )
        })
    )
}

function tabComp (create, root, tab) {
    return create('button', {
        style: {
            ...tabButtonStyle,
            backgroundColor:
                root.state.activeTab === tab
                    ? colorTheme.lightgray1
                    : colorTheme.darkgray1
        },
        onClick: () => root.onChangeTab(tab)
    }, create('text', { style: textStyle.S }, commandDataTypes[tab].displayName))
}

function windowComps (create, root) {
    return windowComp(
        create, root, root.state.triggerData[root.state.activeTab]
    )
}

function windowComp (create, root, data) {
    return create('div', null,
        smoothTabComp(create, root, data),
        create('div', { style: triggerWindowStyle },
            Object.keys(data.triggers).map(i => {
                return triggerComp(create, root, data, parseInt(i))
            }),
            create('button', {
                style: {
                    ...squareButtonStyle,
                    position: 'relative',
                    right: '10px',
                    bottom: '4.5px'
                },
                onClick: () => root.createTrigger()
            },
            create('text', {
                style: {
                    ...textStyle.L,
                    fontWeight: 900
                }
            }, '+')
            )
        )
    )
}

function smoothTabComp (create, root, data) {
    return create('div', { style: smoothTabStyle },
        create('text', { style: textStyle.S }, 'Smoothing'),
        data.id !== Triggers.TimeRemap && create('input', {
            style: {
                ...smoothTextInputStyle,
                marginLeft: '5px'
            },
            value: data.smoothing,
            onChange: (event) => root.updateTrigger(
                data.smoothing,
                event.target.value,
                ['smoothing'],
                constraintProps.smoothProps
            )
        }),
        data.id === Triggers.TimeRemap && create('div', { style: checkboxDivStyle },
            create('input', {
                style: checkboxStyle,
                type: 'checkbox',
                onChange: () => root.updateTrigger(
                    root.state.triggerData[root.state.activeTab].interpolate,
                    !root.state.triggerData[root.state.activeTab].interpolate,
                    ['interpolate'],
                    constraintProps.interpolateProps
                )
            }),
            data.interpolate && create('square', { style: checkboxFillStyle })
        )
    )
}

function triggerComp (create, root, data, index) {
    const triggerData = data.triggers[index]

    return create('div', {
        style: {
            ...triggerStyle,
            backgroundColor: index === 0 ? colorTheme.gray : colorTheme.white
        }
    },
    triggerHeaderComp(create, root, triggerData, index),
    data.id === Triggers.Zoom && zoomTriggerComp(create, root, triggerData, index),
    data.id === Triggers.CameraPan && camPanTriggerComp(create, root, triggerData, index),
    data.id === Triggers.CameraFocus && camFocusTriggerComp(create, root, triggerData, index),
    data.id === Triggers.TimeRemap && timeRemapTriggerComp(create, root, triggerData, index)
    )
}

function triggerHeaderComp (create, root, data, index) {
    return create('div', { style: triggerDivStyle },
        create('text', {
            style: {
                ...textStyle.L,
                paddingRight: '10px'
            }
        }, index + 1),
        timeStampComp(create, root, data[0], index),
        create('button', {
            style: {
                ...squareButtonStyle,
                position: 'absolute',
                right: '10px'
            },
            disabled: index === 0,
            onClick: () => root.deleteTrigger(index)
        },
        create('text', {
            style: {
                ...textStyle.M,
                color: index === 0 ? colorTheme.darkgray2 : colorTheme.black,
                fontWeight: 900
            }
        }, 'X'))
    )
}

function timeStampComp (create, root, data, index) {
    const tProps = [
        constraintProps.minuteProps,
        constraintProps.secondProps,
        constraintProps.frameProps
    ]

    return data.map((timeValue, timeIndex) => {
        return create('div', null,
            create('text', { style: triggerTextStyle },
                ['TIME', ':', ':'][timeIndex]
            ),
            create('input', {
                style: {
                    ...triggerTextStyle,
                    backgroundColor:
                        index === 0
                            ? colorTheme.darkgray2
                            : colorTheme.white
                },
                disabled: index === 0,
                value: timeValue,
                onChange: (event) => root.updateTrigger(
                    timeValue,
                    event.target.value,
                    ['triggers', index, 0, timeIndex],
                    tProps[timeIndex]
                )
            })
        )
    })
}

function zoomTriggerComp (create, root, data, index) {
    const label = 'ZOOM TO'

    return create('div', null,
        create('text', { style: triggerTextStyle }, label),
        create('input', {
            style: triggerTextStyle,
            value: data[1],
            onChange: (event) => root.updateTrigger(
                data[1],
                event.target.value,
                ['triggers', index, 1],
                constraintProps.zoomProps
            )
        })
    )
}

function camPanTriggerComp (create, root, data, index) {
    const cProps = [
        constraintProps.wProps,
        constraintProps.hProps,
        constraintProps.xProps,
        constraintProps.yProps
    ]
    const labels = ['WIDTH', 'HEIGHT', 'X OFFSET', 'Y OFFSET']

    return create('div', null,
        Object.keys(data[1]).map((prop, propIndex) => {
            return create('div', {
                style: {
                    alignItems: 'center',
                    display: 'inline-block'
                }
            },
            create('text', { style: triggerTextStyle }, labels[propIndex]),
            create('input', {
                style: triggerTextStyle,
                value: data[1][prop],
                onChange: (event) => root.updateTrigger(
                    data[1][prop],
                    event.target.value,
                    ['triggers', index, 1, prop],
                    cProps[propIndex]
                )
            })
            )
        })
    )
}

function camFocusTriggerComp (create, root, data, index) {
    const dropdownIndex = root.state.focuserDropdowns[index]

    return create('div', null,
        create('select', {
            style: dropdownHeaderStyle,
            value: dropdownIndex,
            onChange: (event) => root.onChangeDropdown(
                index, event.target.value
            )
        },
        Object.keys(data[1]).map(riderIndex => {
            const riderNum = 1 + parseInt(riderIndex)

            return create('option', {
                style: dropdownOptionStyle,
                value: parseInt(riderIndex)
            }, create('text', null, `Rider ${riderNum}`))
        })),
        create('text', { style: triggerTextStyle }, 'WEIGHT'),
        create('input', {
            style: triggerTextStyle,
            value: data[1][dropdownIndex],
            onChange: (event) => root.updateTrigger(
                data[1][dropdownIndex],
                event.target.value,
                ['triggers', index, 1, dropdownIndex],
                constraintProps.fWeightProps
            )
        })
    )
}

function timeRemapTriggerComp (create, root, data, index) {
    const label = 'TIME SCALE'

    return create('div', null,
        create('text', { style: triggerTextStyle }, label),
        create('input', {
            style: triggerTextStyle,
            value: data[1],
            onChange: (event) => root.updateTrigger(
                data[1],
                event.target.value,
                ['triggers', index, 1],
                constraintProps.timeProps
            )
        })
    )
}

function readWriteComps (create, root) {
    return create('div', null,
        create('button', {
            style: {
                ...readWriteButtonStyle,
                left: '18px'
            },
            onClick: () => root.onRead()
        },
        create('text', { style: textStyle.M }, 'Read')
        ),
        create('button', {
            style: {
                ...readWriteButtonStyle,
                right: '18px'
            },
            onClick: () => root.onCommit()
        },
        create('text', { style: textStyle.M }, 'Commit')
        ),
        create('div', { style: errorContainerStyle },
            create('text', {
                style: {
                    ...textStyle.M,
                    color: root.state.hasError ? 'Red' : 'Black'
                }
            }, root.state.errorMessage)
        )
    )
}
