module.exports = function(schema, option) {
  const {_, prettier} = option;

  // template
  const template = [];

  // imports
  const imports = [];

  // Global Public Functions
  const utils = [];

  // data
  const datas = [];

  const defaultProps = {};

  // methods
  const methods = [];

  const expressionName = [];

  // lifeCycles
  const lifeCycles = [];

  // styles
  const styles = [];

  const styles4vw = [];

  // box relative style
  const boxStyleList = ['fontSize', 'marginTop', 'marginBottom', 'paddingTop', 'paddingBottom', 'height', 'top', 'bottom', 'width', 'maxWidth', 'left', 'right', 'paddingRight', 'paddingLeft', 'marginLeft', 'marginRight', 'lineHeight', 'borderBottomRightRadius', 'borderBottomLeftRadius', 'borderTopRightRadius', 'borderTopLeftRadius', 'borderRadius'];

  // no unit style
  const noUnitStyles = ['opacity', 'fontWeight'];

  const lifeCycleMap = {
    '_constructor': 'created',
    'getDerivedStateFromProps': 'beforeUpdate',
    'render': '',
    'componentDidMount': 'mounted',
    'componentDidUpdate': 'updated',
    'componentWillUnmount': 'beforeDestroy'
  }

  const width = schema.rect.width || 1920;
  // const viewportWidth = option.responsive.viewportWidth || 750;

  // 1rpx = width / 1920 px
  const _w = ( 1920 / width);
  // console.log(`_w: ${_w}`);

  // 如果组件配置了属性responsive==vw，则返回true
  const isResponsiveVW = () => {
    return schema.props.responsive == 'vw';
  }

  const isExpression = (value) => {
    return /^\{\{.*\}\}$/.test(value);
  }

  const transformEventName = (name) => {
    return name.replace('on', '').toLowerCase();
  }

  const toString = (value) => {
    if ({}.toString.call(value) === '[object Function]') {
      return value.toString();
    }
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, (key, value) => {
        if (typeof value === 'function') {
          return value.toString();
        } else {
          return value;
        }
      })
    }

    return String(value);
  };

  // convert to responsive unit, such as rpx
  const parseStyle = (style, toVW) => {
    const styleData = [];
    for (let key in style) {
      let value = style[key];
      if (boxStyleList.indexOf(key) != -1) {
        // 默认采用vw布局
        if (toVW) {
          value = (parseInt(value) * _w).toFixed(2);
          value = value == 0 ? value : (value*100/1920).toFixed(2) + 'vw';
        } else {
          value = (parseInt(value)).toFixed(2);
          value = value == 0 ? value : value + 'px';
        }
        styleData.push(`${_.kebabCase(key)}: ${value}`);
      } else if (noUnitStyles.indexOf(key) != -1) {
        styleData.push(`${_.kebabCase(key)}: ${isNaN(parseFloat(value)) ? value : parseFloat(value) }`);
      } else {
        styleData.push(`${_.kebabCase(key)}: ${value}`);
      }
    }
    return styleData.join(';');
  }

  // parse function, return params and content
  const parseFunction = (func) => {
    const funcString = func.toString();
    const name = funcString.slice(funcString.indexOf('function'), funcString.indexOf('(')).replace('function ','');
    const params = funcString.match(/\([^\(\)]*\)/)[0].slice(1, -1);
    const content = funcString.slice(funcString.indexOf('{') + 1, funcString.lastIndexOf('}'));
    return {
      params,
      content,
      name
    };
  }

  // parse layer props(static values or expression)
  const parseProps = (value, isReactNode, constantName) => {
    // console.log(`constantName: ${constantName}, ${value}`)
    // console.log(`parseProps:`, value, isReactNode, constantName);
    if (typeof value === 'string') {
      if (isExpression(value)) {
        if (isReactNode) {
          return `{{${value.slice(7, -2)}}}`;
        } else {
          return value.slice(2, -2);
        }
      }

      if (isReactNode) {
        defaultProps[_.camelCase(constantName)] = value;
        return `{{${_.camelCase(constantName)}}}`;
      } else if (_.camelCase(constantName)) { // save to constant
        // expressionName[constantName] = expressionName[constantName] ? expressionName[constantName] + 1 : 1;
        // const name = `${constantName}${expressionName[constantName]}`;
        defaultProps[_.camelCase(constantName)] = value;
        return `"${_.camelCase(constantName)}"`;
      } else {
        return `"${value}"`;
      }
    } else if (typeof value === 'function') {
      const {params, content, name} = parseFunction(value);
      expressionName[name] = expressionName[name] ? expressionName[name] + 1 : 1;
      methods.push(`${name}_${expressionName[name]}(${params}) {${content}}`);
      return `${name}_${expressionName[name]}`;
    }
  }

  const parsePropsKey = (key, value) => {
    if (typeof value === 'function') {
      return `@${transformEventName(key)}`;
    } else {
      return `:${key}`;
    }
  }

  // parse async dataSource
  const parseDataSource = (data) => {
    const name = data.id;
    const {uri, method, params} = data.options;
    const action = data.type;
    let payload = {};

    switch (action) {
      case 'fetch':
        if (imports.indexOf(`import {request, fetch} from '@/common/request'`) === -1) {
          imports.push(`import {request, fetch} from '@/common/request'`);
        }
        payload = {
          method: method
        };

        break;
      case 'jsonp':
        if (imports.indexOf(`import {fetchJsonp} from fetch-jsonp`) === -1) {
          imports.push(`import jsonp from 'fetch-jsonp'`);
        }
        break;
    }

    Object.keys(data.options).forEach((key) => {
      if (['uri', 'method', 'params'].indexOf(key) === -1) {
        payload[key] = toString(data.options[key]);
      }
    });

    // params parse should in string template
    if (params) {
      payload = `${toString(payload).slice(0, -1)} ,body: ${isExpression(params) ? parseProps(params) : toString(params)}}`;
    } else {
      payload = toString(payload);
    }

    let result = `{
      ${action}(${parseProps(uri)}, ${toString(payload)})
        .then((response) => response.json())
    `;

    if (data.dataHandler) {
      const { params, content } = parseFunction(data.dataHandler);
      result += `.then((${params}) => {${content}})
        .catch((e) => {
          console.log('error', e);
        })
      `
    }

    result += '}';

    return `${name}() ${result}`;
  }

  // parse loop render
  const parseLoop = (loop, loopArg, render) => {
    let data;
    let loopArgItem = (loopArg && loopArg[0]) || 'item';
    let loopArgIndex = (loopArg && loopArg[1]) || 'index';

    if (Array.isArray(loop)) {
      data = '循环数据变量名';
      datas.push(`${data}: ${toString(loop)}`);
    } else if (isExpression(loop)) {
      data = loop.slice(2, -2).replace('this.state.', '');
    }
    // add loop key
    const tagEnd = render.indexOf('>');
    const keyProp = render.slice(0, tagEnd).indexOf('key=') == -1 ? `:key="${loopArgIndex}"` : '';
    render = `
      ${render.slice(0, tagEnd)}
      v-for="(${loopArgItem}, ${loopArgIndex}) in ${data}"  
      ${keyProp}
      ${render.slice(tagEnd)}`;
    // remove `this` 
    const re = new RegExp(`this.${loopArgItem}`, 'g')
    render = render.replace(re, loopArgItem);

    return render;
  }

  // generate render xml
  const generateRender = (schema) => {
    // console.log(schema)
    const type = schema.componentName.toLowerCase();
    const className = schema.props && schema.props.className;
    const classString = className ? ` class="${className}"` : '';
    if (className) {
      styles.push(`
        .${className} {
          ${parseStyle(schema.props.style)}
        }
      `);
      styles4vw.push(`
        .${className} {
          ${parseStyle(schema.props.style, true)}
        }
      `);
    }

    let xml;
    let props = '';

    Object.keys(schema.props).forEach((key) => {
      // console.log(key)
      if (['className', 'style', 'text', 'src', 'js-component', 'responsive', 'lines'].indexOf(key) === -1) {
        props += ` ${parsePropsKey(key, schema.props[key])}="${parseProps(schema.props[key])}"`;
      }
    })
    // console.log(type)
    switch(type) {
      case 'text':
        const innerText = parseProps(schema.props.text, true, schema.props.className);
          xml = `<span${classString}>${innerText}</span> `;
        break;
      case 'image':
        const source = parseProps(schema.props.src, false, schema.props.className);
          xml = `<img${classString} :src=${source} /> `;
        break;
      case 'select':
        xml = ` <el-select v-model="value" placeholder="请选择">
                  <el-option
                    v-for="item in 下拉选择器变量名"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select> `;
      break;
      case 'input':
        xml = `<el-input v-model="输入框变量名" placeholder="请输入内容"></el-input>`;
      break;
      case 'timepicker':
        xml = `<el-time-select
          v-model="时间选择器变量名"
          placeholder="选择时间">
        </el-time-select> `;
      break;
      case 'table':
        xml = `<el-table
        :data="表格数据变量名"
        style="width: 100%">
          <el-table-column
            prop="date"
            label="实例表头名"
            width="180">
          </el-table-column>
        </el-table-column>
      </el-table>`;
      break;
      case 'input':
        xml = `<el-input v-model="input" placeholder="请输入内容"></el-input>`;
      break;
      case 'div':
      case 'page':
      case 'block':
      case 'component':
        // 在这里处理将标记了组件key字段的组件进行替换
        if (schema.props['js-component']) {
          xml = `{{"js-component=${schema.props['js-component']}"}}`
        } else {
          if (schema.children && schema.children.length) {
           
            schema.children.forEach(item=>{
              // console.log(item)
            })
              xml = `<div${classString}>${transform(schema.children)}</div>`;
          } else {
              xml = `<div${classString} />`;
          }
        }
        break;
    }
    if (schema.loop) {
      xml = parseLoop(schema.loop, schema.loopArgs, xml)
    }
    // transformHtml(xml)
    return xml;
  }
  
  // parse schema
  const transform = (schema) => {
    let result = '';
    if (Array.isArray(schema)) {
      schema.forEach((layer) => {
        result += transform(layer);
      });
    } else {
      const type = schema.componentName.toLowerCase();

      if (['page', 'block', 'component'].indexOf(type) !== -1) {
        // 容器组件处理: state/method/dataSource/lifeCycle/render
        const init = [];
        if (schema.state) {
          datas.push(`${toString(schema.state).slice(1, -1)}`);
        }

        if (schema.methods) {
          Object.keys(schema.methods).forEach((name) => {
            const { params, content } = parseFunction(schema.methods[name]);
            methods.push(`${name}(${params}) {${content}}`);
          });
        }
        if (schema.dataSource && Array.isArray(schema.dataSource.list)) {
          schema.dataSource.list.forEach((item) => {
            if (typeof item.isInit === 'boolean' && item.isInit) {
              init.push(`this.${item.id}();`)
            } else if (typeof item.isInit === 'string') {
              init.push(`if (${parseProps(item.isInit)}) { this.${item.id}(); }`)
            }
            methods.push(parseDataSource(item));
          });

          if (schema.dataSource.dataHandler) {
            const { params, content } = parseFunction(schema.dataSource.dataHandler);
            methods.push(`dataHandler(${params}) {${content}}`);
            init.push(`this.dataHandler()`);
          }
        }

        if (schema.lifeCycles) {
          if (!schema.lifeCycles['_constructor']) {
            lifeCycles.push(`${lifeCycleMap['_constructor']}() { ${init.join('\n')}}`);
          }

          Object.keys(schema.lifeCycles).forEach((name) => {
            const vueLifeCircleName = lifeCycleMap[name] || name;
            const { params, content } = parseFunction(schema.lifeCycles[name]);

            if (name === '_constructor') {
              lifeCycles.push(`${vueLifeCircleName}() {${content} ${init.join('\n')}}`);
            } else {
              lifeCycles.push(`${vueLifeCircleName}() {${content}}`);
            }
          });
        }
        template.push(generateRender(schema));
        // console.log(222)
      } else {
        result += generateRender(schema);
      }
    }

    return result;
  };

  if (option.utils) {
    Object.keys(option.utils).forEach((name) => {
      utils.push(`const ${name} = ${option.utils[name]}`);
    });
  }

  // start parse schema
  transform(schema);
  // console.log(`defaultProps: ${JSON.stringify(defaultProps)}`);
  datas.push(`defaultProps: ${toString(defaultProps)}`);

  const prettierOpt = {
    parser: 'vue',
    printWidth: 80,
    singleQuote: true
  };


  return {
    panelDisplay: [
      {
        panelName: `index.vue`,
        panelValue: prettier.format(`
          <template>
              ${template}
          </template>
          <script>
            ${imports.join('\n')}
            export default {
              data() {
                return ${JSON.stringify(defaultProps)}
              },
              methods: {
                ${methods.join(',\n')}
              },
              ${lifeCycles.join(',\n')}
            }
          </script>
          <style>
          @import "./index.response.css";
          </style>
        `, prettierOpt),
        panelType: 'vue',
      },
      {
        panelName: 'index.css',
        panelValue: prettier.format(`${styles.join('\n')}`, {parser: 'css'}),
        panelType: 'css'
      },
      {
        panelName: 'index.response.css',
        panelValue: prettier.format(styles4vw.join('\n'), {parser: 'css'}),
        panelType: 'css'
      }
    ],
    renderData: {
      template: template,
      imports: imports,
      datas: datas,
      methods: methods,
      lifeCycles: lifeCycles,
      styles: styles

    },
    noTemplate: true
  };
}
