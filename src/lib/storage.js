import ScratchStorage from '@turbowarp/scratch-storage';

import defaultProject from './default-project';

// 修复1: 添加缺失的 RequestMetadata 接口
class RequestMetadata {
  /**
   * 创建请求元数据对象
   * @param {object} options 配置选项
   * @param {string} options.method HTTP方法 ('GET'/'POST'等)
   * @param {Object.<string, string>} options.headers 请求头
   * @param {string} options.url 目标URL
   * @param {string} [options.body] 请求体（POST/PUT用）
   * @param {boolean} [options.withCredentials] 是否携带凭据
   */
  constructor({ method, headers, url, body, withCredentials }) {
    this.method = method;
    this.headers = headers;
    this.url = url;
    this.body = body;
    this.withCredentials = withCredentials;
  }
}

/**
 * Wrapper for ScratchStorage which adds default web sources.
 * @todo make this more configurable
 */
class Storage extends ScratchStorage {
    constructor () {
        super();
        this.cacheDefaultProject();
        
        // 修复2: 添加必须的 scratchFetch 接口
        this.scratchFetch = {
            // 添加缺失的 RequestMetadata 类
            RequestMetadata: RequestMetadata,
            
            // 添加默认fetch函数实现
            async fetch(requestMetadata) {
                try {
                    const response = await fetch(requestMetadata.url, {
                        method: requestMetadata.method,
                        headers: requestMetadata.headers,
                        body: requestMetadata.body,
                        credentials: requestMetadata.withCredentials ? 'include' : 'same-origin'
                    });
                    
                    if (!response.ok) {
                        throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
                    }
                    
                    // 确保返回统一的接口格式
                    return {
                        async text() { return response.text(); },
                        async json() { return response.json(); },
                        async arrayBuffer() { return response.arrayBuffer(); }
                    };
                } catch (error) {
                    console.error('scratchFetch error:', error);
                    throw new Error(`Fetch failed: ${error.message}`);
                }
            }
        };
    }
    
    // 修复3: 确保接口兼容性 - 添加TurboWarp所需的新方法
    /**
     * TurboWarp特定方法 - 设置资源请求的基础URL
     * @param {string} assetHost 资源主机地址
     */
    setAssetHost(assetHost) {
        this.assetHost = assetHost;
        this._updateAssetConfigs();
    }
    
    /**
     * TurboWarp特定方法 - 设置项目请求的基础URL
     * @param {string} projectHost 项目主机地址
     */
    setProjectHost(projectHost) {
        this.projectHost = projectHost;
        this._updateProjectConfigs();
    }
    
    // 私有方法：更新资产配置
    _updateAssetConfigs() {
        this.addWebStore(
            [this.AssetType.ImageVector, this.AssetType.ImageBitmap, this.AssetType.Sound],
            asset => `${this.assetHost}/internalapi/asset/${asset.assetId}.${asset.dataFormat}/get/`,
            () => ({ method: 'POST' })
        );
    }
    
    // 私有方法：更新项目配置
    _updateProjectConfigs() {
        this.addWebStore(
            [this.AssetType.Project],
            projectAsset => `${this.projectHost}/${projectAsset.assetId}`,
            () => ({ url: `${this.projectHost}/` })
        );
    }

    // 保留原有方法...
    addOfficialScratchWebStores() {
        // 修复4: 不再使用bind，直接使用箭头函数保持上下文
        this.addWebStore(
            [this.AssetType.Project],
            this.getProjectGetConfig,
            this.getProjectCreateConfig,
            this.getProjectUpdateConfig
        );
        
        this.addWebStore(
            [this.AssetType.ImageVector, this.AssetType.ImageBitmap, this.AssetType.Sound],
            this.getAssetGetConfig,
            this.getAssetCreateConfig,
            this.getAssetCreateConfig
        );
    }
    
    // 修复5: 使用箭头函数解决this绑定问题
    setProjectToken = (projectToken) => {
        this.projectToken = projectToken;
    }
    
    // 修复6: 使用箭头函数保持this上下文
    getProjectGetConfig = (projectAsset) => {
        const path = `${this.projectHost}/${projectAsset.assetId}`;
        const qs = this.projectToken ? `?token=${this.projectToken}` : '';
        return path + qs;
    }
    
    getProjectCreateConfig = () => {
        return {
            url: `${this.projectHost}/`,
            withCredentials: true
        };
    }
    
    getProjectUpdateConfig = (projectAsset) => {
        return {
            url: `${this.projectHost}/${projectAsset.assetId}`,
            withCredentials: true
        };
    }
    
    getAssetGetConfig = (asset) => {
        return `${this.assetHost}/internalapi/asset/${asset.assetId}.${asset.dataFormat}/get/`;
    }
    
    getAssetCreateConfig = (asset) => {
        return {
            method: 'post',
            url: `${this.assetHost}/${asset.assetId}.${asset.dataFormat}`,
            withCredentials: true
        };
    }
    
    setTranslatorFunction = (translator) => {
        this.translator = translator;
        this.cacheDefaultProject();
    }
    
    cacheDefaultProject = () => {
        const defaultProjectAssets = defaultProject(this.translator);
        defaultProjectAssets.forEach(asset => this.builtinHelper._store(
            this.AssetType[asset.assetType],
            this.DataFormat[asset.dataFormat],
            asset.data,
            asset.id
        ));
    }
}

const storage = new Storage();

// 修复7: 挂载必须的静态方法到实例
storage.AssetType = { ...ScratchStorage.AssetType };
storage.DataFormat = { ...ScratchStorage.DataFormat };

export default storage;
