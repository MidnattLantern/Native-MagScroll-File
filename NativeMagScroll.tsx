import { View, Text, ScrollView } from "react-native";
import React, { useRef, useState } from "react";
import { StyleSheet } from 'react-native';

const NativeMagScroll = () => {
        // states
        const [selectedValue, setSelectedValue] = useState<null | number | string>(null);
        const libraryReferences = useRef<(Text | null)[]>([]);
        const scrollViewReference = useRef<ScrollView>(null);
        const [scrollViewPosition, setScrollViewPosition] = useState(0);
        const WaitForMomentumEnd = useRef(false);

        // libraries
        const library = [
            { 'id': 0, 'value': null },
            { 'id': 1, 'value': 10 },
            { 'id': 2, 'value': 3 },
            { 'id': 3, 'value': 2 },
            { 'id': 4, 'value': 1 },
            { 'id': 5, 'value': 0 },
            { 'id': 6, 'value': -1 }
        ];

        // functions
        const ScrollToItem = (index: number) => {
            if (scrollViewReference.current) {
                scrollViewReference.current.scrollTo({ y: (50 * index), animated: true });
            }
        };
        const LocalizeClosestItem = () => {
            const references = libraryReferences.current;
            let closestIndex = null; // retrieve index of the closest item from library
            let closestDistance = Infinity; // retrieve distance from the limits within 25
            console.log("-----")
            references.forEach((reference, index) => {
                if (reference) {
                    reference.measure((x, y, width, height, pageX, pageY) => {
                        const distance = Math.abs(y - scrollViewPosition)
                        if (distance < closestDistance) {
                            closestIndex = index;
                            closestDistance = distance;
                            console.log(closestIndex, closestDistance)
                            ScrollToItem(closestIndex)
                            setSelectedValue(library[index].value)
                        } 
                    })
                }
            })
        };
        const LogElementMeasurements = (element: Text | null) => {
            element?.measure((x, y, width, height, pageX, pageY) => {
                console.log(y)
            });
        };

        // components
        const MarginalArray = ({ children }: { children: React.ReactNode }) => {
            return (
                <View style={Styles.MarginalArray}>
                    {children}
                </View>
            )
        };

    // render
    return(
        <>
        <View style={Styles.Foundation}>
            <View style={[Styles.ControlItem]}>
                <ScrollView
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                scrollEnabled={true}
                ref={scrollViewReference}
                onPointerEnter={() => {
                    console.log('cursor enter')
                }}
                onPointerLeave={() => {
                    console.log('cursor leave')
                    LocalizeClosestItem()
                }}
                onMomentumScrollBegin={() => {
                        console.log('begin momentum');
                        WaitForMomentumEnd.current = true;
                }}
                onMomentumScrollEnd={() => {
                          if (WaitForMomentumEnd.current) {
                            console.log('end momentum');
                            WaitForMomentumEnd.current = false;
                            console.log('localize via momentum');
                            LocalizeClosestItem();
                        }
                }}
                onScrollEndDrag={() => {

                    console.log('release');
                    setTimeout(() => {
                        if (!WaitForMomentumEnd.current) {
                            LocalizeClosestItem();
                            console.log('localize via release');
                        }
                    }, 50); // delay to allow other behaviours to interfere
                }}
                onTouchStart={() => {
                    console.log('Touch / interrupt momentum');
                }}
                onScroll={(event) => {
                    setScrollViewPosition((event.nativeEvent.contentOffset.y)+50)
                }}
                scrollEventThrottle={50}
                >
                    <MarginalArray>
                        {library.map((item, index) => (
                            <Text 
                            onPress={() => {
                                setSelectedValue(item.value);
                                ScrollToItem(index);
                                setTimeout(() => {
                                    LogElementMeasurements(libraryReferences.current[index]);
                                }, 0); // to make it respond on the first click/ tap
                            }}
                            style={Styles.ControlItemSize}
                            key={`${item.id}-${index}`}
                            id={(index ?? 'null').toString()}
                            ref={(element) => (libraryReferences.current[index] = element)}
                            >{item.value !== null ? item.value : '-'}</Text>
                        ))}
                    </MarginalArray>
                </ScrollView>
            </View>
        <Text style={Styles.DisplaySelectedValue}>{'Selected value: '} {selectedValue}</Text>
        <Text style={Styles.DisplaySelectedValue}>{'scrollViewPosition: '} {scrollViewPosition}</Text>
        </View>
        </>
    )
};

export default NativeMagScroll;

const ColorThemes = {
    background: 'rgb(26, 24, 28))',
    dark: 'rgb(37, 35, 39)',
    edge: 'rgb(60, 58, 62)',
    white: 'rgb(210, 200, 200)',
    whiteOffset: 'rgb(245, 190, 175)',
};

const Styles = StyleSheet.create({
    Foundation: {
        backgroundColor: ColorThemes.background,
        alignItems: 'center',
        justifyContent: 'center',
        width: 225,
        height: 225
    },
    ControlArray: {
        flexDirection: 'row'
    },
    ControlItem: {
        flexDirection: 'column',
        margin: 10,
        width: 100,
        height: 150,
        borderWidth: 1,
        borderColor: ColorThemes.edge,
        borderStyle: 'solid',
        alignItems: 'center',
        justifyContent: 'center'
    },
    ControlItemSize: {
        width: 98,
        height: 50,
        fontSize: 25,
        textAlign: 'center',
        textAlignVertical: 'center',
        lineHeight: 50,
        color: ColorThemes.whiteOffset
    },
    MarginalArray: {
        paddingTop: 50,
        paddingBottom: 50,
        flexDirection: 'column'
    },
    DisplaySelectedValue: {
        color: ColorThemes.whiteOffset
    }
})