import React from 'react';
import { TouchableOpacity, Text, View, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { _constructStyles, _getElementClassStyles } from './HTMLStyles';
import HTMLImage from './HTMLImage';

export function a (htmlAttribs, children, convertedCSSStyles, passProps) {
    const style = _constructStyles({
        tagName: 'a',
        htmlAttribs,
        passProps,
        styleSet: passProps.parentWrapper === 'Text' ? 'TEXT' : 'VIEW'
    });
    // !! This deconstruction needs to happen after the styles construction since
    // the passed props might be altered by it !!
	const { parentWrapper, onLinkPress, key, data } = passProps;

	const onPress = (evt) => {
		if (onLinkPress && htmlAttribs && htmlAttribs['href']) {
			return onLinkPress(evt, htmlAttribs.href, htmlAttribs);
		} else if (onLinkPress && htmlAttribs && (htmlAttribs['data-embed-src'] || htmlAttribs['src'])) {
			return onLinkPress(evt, htmlAttribs['data-embed-src'] || htmlAttribs['src'], htmlAttribs);
		} else {
			return undefined;
		}
	}
	
    if (parentWrapper === 'Text') {
        return (
			<Text {...passProps} style={style} onPress={onPress} key={key}>
				{ children || data }
			</Text>
        );
    } else {
		if (htmlAttribs['data-embed-src'] || htmlAttribs['src']) {
			return (
				<View onPress={onPress} key={key}>
					<Text style={{color: '#1d67a4', textDecorationLine: 'underline'}} onPress={onPress}>
						{decodeURI((htmlAttribs['data-embed-src'] || htmlAttribs['src'])
							.substring(0, (htmlAttribs['data-embed-src'] || htmlAttribs['src']).lastIndexOf('?')))}
					</Text>
				</View>
			)
		} else {
			return (
				<View onPress={onPress} key={key}>
					{ children || data }
				</View>
			);
		}
    }
}

export function img (htmlAttribs, children, convertedCSSStyles, passProps = {}) {
    if (!htmlAttribs.src) {
        return false;
    }

    const style = _constructStyles({
        tagName: 'img',
        htmlAttribs,
        passProps,
        styleSet: 'IMAGE'
    });
	const { src, alt, width, height } = htmlAttribs;

    return (
        <HTMLImage
          source={{ uri: htmlAttribs['data-src'] ? htmlAttribs['data-src'] : src }}
          alt={alt}
          width={width}
          height={height}
          style={style}
          {...passProps}
        />
    );
}

export function ul (htmlAttribs, children, convertedCSSStyles, passProps = {}) {
    const style = _constructStyles({
        tagName: 'ul',
        htmlAttribs,
        passProps,
        styleSet: 'VIEW'
    });
    const { allowFontScaling, rawChildren, nodeIndex, key, baseFontStyle, listsPrefixesRenderers } = passProps;
	const baseFontSize = baseFontStyle.fontSize || 14;

    children = children && children.map((child, index) => {
        const rawChild = rawChildren[index];
        let prefix = false;
        const rendererArgs = [
            htmlAttribs,
            children,
            convertedCSSStyles,
            {
                ...passProps,
                index
            }
        ];

        if (rawChild) {
            if (rawChild.parentTag === 'ul' && rawChild.tagName === 'li') {
                prefix = listsPrefixesRenderers && listsPrefixesRenderers.ul ? listsPrefixesRenderers.ul(...rendererArgs) : (
                    <View style={{
                        marginRight: 10,
						width: baseFontSize / 2.8,
                        height: baseFontSize / 2.8,
                        marginTop: baseFontSize / 1.8,
                        borderRadius: baseFontSize / 2.8,
						backgroundColor: 'black',
						position: 'absolute'
                    }} />
                );
            } else if (rawChild.parentTag === 'ol' && rawChild.tagName === 'li') {
                prefix = listsPrefixesRenderers && listsPrefixesRenderers.ol ? listsPrefixesRenderers.ol(...rendererArgs) : (
                    <Text allowFontScaling={allowFontScaling} style={{ position: 'absolute', fontSize: baseFontSize }}>{ index + 1 })</Text>
                );
            }
		}

        return (
            <View key={`list-${nodeIndex}-${index}-${key}`} style={{ flexDirection: 'row', marginBottom: 10 }}>
                <View style={{ flex: 1, paddingLeft: 7, flexDirection: 'row', flexWrap: 'wrap' }}>{ prefix }{ child }</View>
            </View>
        );
    });
    return (
        <View style={style} key={key}>
            { children }
        </View>
	);
}
export const ol = ul;

export function iframe (htmlAttribs, children, convertedCSSStyles, passProps) {
    // const { staticContentMaxWidth, tagsStyles, classesStyles } = passProps;

    // const tagStyleHeight = tagsStyles.iframe && tagsStyles.iframe.height;
    // const tagStyleWidth = tagsStyles.iframe && tagsStyles.iframe.width;

    // const classStyles = _getElementClassStyles(htmlAttribs, classesStyles);
    // const classStyleWidth = classStyles.width;
    // const classStyleHeight = classStyles.height;

    // const attrHeight = htmlAttribs.height ? parseInt(htmlAttribs.height) : false;
    // const attrWidth = htmlAttribs.width ? parseInt(htmlAttribs.width) : false;

    // const height = attrHeight || classStyleHeight || tagStyleHeight || 200;
    // const width = attrWidth || classStyleWidth || tagStyleWidth || staticContentMaxWidth;

    // const style = _constructStyles({
    //     tagName: 'iframe',
    //     htmlAttribs,
    //     passProps,
    //     styleSet: 'VIEW',
    //     additionalStyles: [{ height, width }]
    // });

    // const source = htmlAttribs.srcdoc ? { html: htmlAttribs.srcdoc } : { uri: htmlAttribs.src };

	return a(htmlAttribs, children, convertedCSSStyles, passProps);
//     return (
// 		<WebView key={passProps.key} source={source} style={style} />
//     );
}

export function pre (htmlAttribs, children, convertedCSSStyles, passProps) {
    return (
        <Text
          key={passProps.key}
          style={{ fontFamily: Platform.OS === 'android' ? 'monospace' : 'Menlo' }}>
            { children }
        </Text>
	);
}

export function br (htmlAttribs, children, convertedCSSStyles, passProps) {
    return (
        <Text
            allowFontScaling={passProps.allowFontScaling}
            style={{ height: 1.2 * passProps.emSize, flex: 1 }}
            key={passProps.key}
        >
            {"\n"}
        </Text>
    );
}

export function textwrapper (htmlAttribs, children, convertedCSSStyles, { allowFontScaling, key }) {
	return (
        <Text allowFontScaling={allowFontScaling} key={key} style={convertedCSSStyles}>{ children }</Text>
	);
}
