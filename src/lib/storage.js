import ScratchStorage from '@turbowarp/scratch-storage';
import defaultProject from './default-project';

// 修复1: 添加缺失的 RequestMetadata 类
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
 * ScratchStorage 的包装类，添加默认 web 来源
 */
class Storage extends ScratchStorage {
  constructor() {
    super();
    this.cacheDefaultProject();

    // 修复2: 添加 scratchFetch 接口
    this.scratchFetch = {
      RequestMetadata,
      async fetch(requestMetadata) {
        try {
          const response = await fetch(requestMetadata.url, {
            method: requestMetadata.method,
            headers: requestMetadata.headers,
            body: requestMetadata.body,
            credentials: requestMetadata.withCredentials ? 'include' : 'same-origin',
          });

          if (!response.ok) {
            throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
          }

          return {
            text: async () => response.text(),
            json: async () => response.json(),
            arrayBuffer: async () => response.arrayBuffer(),
          };
        } catch (error) {
          console.error('scratchFetch error:', error);
          throw new Error(`Fetch failed: ${error.message}`);
        }
      },
    };
  }

  /**
   * 设置资源请求的基础URL
   * @param {string} assetHost 资源主机地址
   */
  setAssetHost = (assetHost) => {
    this.assetHost = assetHost;
    this._updateAssetConfigs();
  };

  /**
   * 设置项目请求的基础URL
   * @param {string} projectHost 项目主机地址
   */
  setProjectHost = (projectHost) => {
    this.projectHost = projectHost;
    this._updateProjectConfigs();
  };

  /**
   * 更新资产配置
   * @private
   */
  _updateAssetConfigs = () => {
    this.addWebStore(
      [this.AssetType.ImageVector, this.AssetType.ImageBitmap, this.AssetType.Sound],
      (asset) => `${this.assetHost}/internalapi/asset/${asset.assetId}.${asset.dataFormat}/get/`,
      () => ({ method: 'POST' })
    );
  };

  /**
   * 更新项目配置
   * @private
   */
  _updateProjectConfigs = () => {
    this.addWebStore(
      [this.AssetType.Project],
      (projectAsset) => `${this.projectHost}/${projectAsset.assetId}`,
      () => ({ url: `${this.projectHost}/` })
    );
  };

  /**
   * 添加官方 Scratch web 存储
   */
  addOfficialScratchWebStores = () => {
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
  };

  /**
   * 设置项目令牌
   * @param {string} projectToken 项目令牌
   */
  setProjectToken = (projectToken) => {
    this.projectToken = projectToken;
  };

  /**
   * 获取项目获取配置
   * @param {object} projectAsset 项目资产
   * @returns {string} 项目获取 URL
   */
  getProjectGetConfig = (projectAsset) => {
    const path = `${this.projectHost}/${projectAsset.assetId}`;
    const qs = this.projectToken ? `?token=${this.projectToken}` : '';
    return path + qs;
  };

  /**
   * 获取项目创建配置
   * @returns {object} 项目创建配置
   */
  getProjectCreateConfig = () => ({
    url: `${this.projectHost}/`,
    withCredentials: true,
  });

  /**
   * 获取项目更新配置
   * @param {object} projectAsset 项目资产
   * @returns {object} 项目更新配置
   */
  getProjectUpdateConfig = (projectAsset) => ({
    url: `${this.projectHost}/${projectAsset.assetId}`,
    withCredentials: true,
  });

  /**
   * 获取资产获取配置
   * @param {object} asset 资产
   * @returns {string} 资产获取 URL
   */
  getAssetGetConfig = (asset) =>
    `${this.assetHost}/internalapi/asset/${asset.assetId}.${asset.dataFormat}/get/`;

  /**
   * 获取资产创建配置
   * @param {object} asset 资产
   * @returns {object} 资产创建配置
   */
  getAssetCreateConfig = (asset) => ({
    method: 'POST',
    url: `${this.assetHost}/${asset.assetId}.${asset.dataFormat}`,
    withCredentials: true,
  });

  /**
   * 设置翻译函数
   * @param {function} translator 翻译函数
   */
  setTranslatorFunction = (translator) => {
    this.translator = translator;
    this.cacheDefaultProject();
  };

  /**
   * 缓存默认项目
   */
  cacheDefaultProject = () => {
    const defaultProjectAssets = defaultProject(this.translator);
    defaultProjectAssets.forEach((asset) =>
      this.builtinHelper._store(
        this.AssetType[asset.assetType],
        this.DataFormat[asset.dataFormat],
        asset.data,
        asset.id
      )
    );
  };

  /**
   * 获取 AssetType（避免直接修改只读属性）
   * @returns {object} AssetType 对象
   */
  getAssetType = () => this.AssetType;

  /**
   * 获取 DataFormat（避免直接修改只读属性）
   * @returns {object} DataFormat 对象
   */
  getDataFormat = () => this.DataFormat;
}

const storage = new Storage();

// 修复3: 导出 AssetType 和 DataFormat，避免直接修改只读属性
export const AssetType = ScratchStorage.AssetType;
export const DataFormat = ScratchStorage.DataFormat;
export default storage;
