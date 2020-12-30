import React, { PureComponent } from 'react';
import { Image, View, Text } from 'react-native';
import FastImage from 'react-native-fast-image';
import PropTypes from 'prop-types';

import Prealoder from '../../../client/components/Preloader'

export default class HTMLImage extends PureComponent {
    constructor (props) {
        super(props);
        this.state = {
            width: props.imagesInitialDimensions.width,
            height: props.imagesInitialDimensions.height,
            loaded: false
        };
    }

    static propTypes = {
        source: PropTypes.object.isRequired,
        alt: PropTypes.string,
        height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        style: Image.propTypes.style,
        imagesMaxWidth: PropTypes.number,
        imagesInitialDimensions: PropTypes.shape({
            width: PropTypes.number,
            height: PropTypes.number
        })
    }

    static defaultProps = {
        imagesInitialDimensions: {
            width: 230,
            height: 230
        }
    }

    componentDidMount () {
        this.getImageSize();
        this.mounted = true;
    }

    componentWillUnmount () {
        this.mounted = false;
    }

    componentDidUpdate(prevProps, prevState) {
        this.getImageSize(this.props);
        this.state.isLoaded = true;
    }

    getDimensionsFromStyle (style, height, width) {
        let styleWidth;
        let styleHeight;

        if (height) {
            styleHeight = height;
        }
        if (width) {
            styleWidth = width;
		}
		
        if (Array.isArray(style)) {
            style.forEach((styles) => {
                if (!width && styles['width']) {
                    styleWidth = styles['width'];
                }
                if (!height && styles['height']) {
                    styleHeight = styles['height'];
                }
            });
        } else {
            if (!width && style['width']) {
                styleWidth = style['width'];
            }
            if (!height && style['height']) {
                styleHeight = style['height'];
            }
        }

        return { styleWidth, styleHeight };
    }

    getImageSize (props = this.props) {
        const { source, imagesMaxWidth, style, height, width } = props;
        const { styleWidth, styleHeight } = this.getDimensionsFromStyle(style, height, width);
        
        if (styleWidth && styleHeight) {
            
            return this.mounted && this.setState({
                width: typeof styleWidth === 'string' && styleWidth.search('%') !== -1 ? styleWidth : parseInt(styleWidth, 10),
                height: typeof styleHeight === 'string' && styleHeight.search('%') !== -1 ? styleHeight : parseInt(styleHeight, 10)
            });
        }
        // Fetch image dimensions only if they aren't supplied or if with or height is missing
        Image.getSize(
            source.uri,
            (originalWidth, originalHeight) => {
                if (!imagesMaxWidth) {
                    return this.mounted && this.setState({ width: originalWidth, height: originalHeight });
                }
                const optimalWidth = imagesMaxWidth <= originalWidth ? imagesMaxWidth : originalWidth;
                const optimalHeight = (optimalWidth * originalHeight) / originalWidth;
                this.mounted && this.setState({ width: optimalWidth, height: optimalHeight, error: false });
            },
            () => {
                this.mounted && this.setState({ error: true });
            }
        );
    }

    validImage (source, style, props = {}) {
        if (source['uri'].indexOf('emoticons') !== -1) {
			return (
                <FastImage
                    source={source}
                    style={[style, { width: 50, height: 40}]}
                    {...props}
                    resizeMode={FastImage.resizeMode.contain}
                />
			);
		} else {
            return (
                <View>
                    <View style={!this.state.loaded && { width: 0, height: 0, opacity: 0 }}>
                        <FastImage
                            source={source}
                            style={[ style, {width: this.state.width, height: this.state.height, alignSelf: 'center'} ]}
                            {...props}
                            resizeMode={FastImage.resizeMode.contain}
                            onLoadStart={() => this.setState({ loaded: false })}
                            onLoadEnd={() => this.setState({ loaded: true })}
                        />
                    </View>

                    { !this.state.loaded && <View style={{height: this.state.height, backgroundColor: '#fff', justifyContent: 'center' }}>
                        <Prealoder/>
                    </View> }
                </View>
            );
		}
    }

    get errorImage () {
        // if it's emoji, print inside the border
        return (
			this.props.source['uri'] && this.props['source']['uri'].indexOf('/emoticons/') !== -1 && this.props['alt'] ? 
				<View style={{ width: 50, height: 50, borderWidth: 1, borderColor: 'lightgray', overflow: 'hidden', justifyContent: 'center' }}>
					{ this.props.alt ? <Text style={{ textAlign: 'center', fontStyle: 'italic' }}>{ this.props.alt }</Text> : false }
				</View> : 
				<FastImage
					style={{ width: '90%', height: 150, alignSelf: 'center'}}
                    source={require('../../../client/img/NoImage-placeholder.png')}
				/>
        );
    }

    render () {
        const { source, style, passProps } = this.props;
        return !(!!this.state.error) ? this.validImage(source, style, passProps) : this.errorImage;
    }
}
