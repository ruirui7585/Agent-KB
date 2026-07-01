async function renderSettings() {
  try {
    const [settings, profile] = await Promise.all([
      API.getSettings(),
      API.getProfile(),
    ]);

    const activityOptions = Object.entries(CONFIG.ACTIVITY_LABELS)
      .map(([key, label]) => `<option value="${key}" ${profile.activity_level === key ? 'selected' : ''}>${label}</option>`)
      .join('');
    const hasCompleteProfile = Boolean(
      profile.gender && profile.height_cm && profile.weight_kg && profile.age
    );
    const estimatedBodyFat = BodyComposition.estimateBodyFatPercentage({
      ...profile,
      body_fat_pct: null,
    });
    const displayedBodyFat = Number(profile.body_fat_pct) || estimatedBodyFat;
    const bodyFatSource = Number(profile.body_fat_pct) ? '实测' : '估算';
    const dailyGoal = settings.daily_cal_goal || CONFIG.DEFAULT_GOAL;

    document.getElementById('content').innerHTML = `
      <div class="settings-header">
        <div>
          <span class="settings-eyebrow">CALSNAP PROFILE</span>
          <h1>我的</h1>
          <p>维护身体数据，让热量与体脂预测更贴近你</p>
        </div>
        <div class="profile-avatar" aria-hidden="true">我</div>
      </div>

      <section class="profile-summary-card">
        <div class="profile-summary-title">
          <div>
            <small>${hasCompleteProfile ? '健康资料已启用' : '资料待完善'}</small>
            <strong>${hasCompleteProfile ? '你的身体数据' : '完善资料开始计算'}</strong>
          </div>
          <span class="${hasCompleteProfile ? 'ready' : ''}">${hasCompleteProfile ? '已同步' : '待保存'}</span>
        </div>
        <div class="profile-summary-metrics">
          <div><small>体重</small><b>${profile.weight_kg || '--'}<em>kg</em></b></div>
          <div><small>体脂率 · ${bodyFatSource}</small><b>${displayedBodyFat || '--'}<em>%</em></b></div>
          <div><small>基础消耗</small><b>${profile.baseline_expenditure || '--'}<em>kcal</em></b></div>
        </div>
      </section>

      ${hasCompleteProfile ? '' : `
        <div class="settings-notice">
          <span>!</span>
          <p><b>先完善必填资料</b>保存后，首页、记录、趋势和运动估算会同步更新。</p>
        </div>
      `}

      <section class="settings-section-card">
        <div class="settings-section-head">
          <div><span>01</span><h2>身体数据</h2></div>
          <small>用于个性化计算</small>
        </div>

        <div class="settings-field-grid">
          <label class="settings-field">
            <span>性别 <i>必填</i></span>
            <select id="profile-gender" class="input" autocomplete="off">
              <option value="" ${profile.gender ? '' : 'selected'} disabled>请选择</option>
              <option value="male" ${profile.gender === 'male' ? 'selected' : ''}>男</option>
              <option value="female" ${profile.gender === 'female' ? 'selected' : ''}>女</option>
            </select>
          </label>
          <label class="settings-field">
            <span>年龄 <i>必填</i></span>
            <div class="input-with-unit">
              <input type="number" id="profile-age" class="input" value="${profile.age || ''}" placeholder="28" min="10" max="120" autocomplete="off">
              <em>岁</em>
            </div>
          </label>
          <label class="settings-field">
            <span>身高 <i>必填</i></span>
            <div class="input-with-unit">
              <input type="number" id="profile-height" class="input" value="${profile.height_cm || ''}" placeholder="175" min="50" max="250" autocomplete="off">
              <em>cm</em>
            </div>
          </label>
          <label class="settings-field">
            <span>体重 <i>必填</i></span>
            <div class="input-with-unit">
              <input type="number" id="profile-weight" class="input" value="${profile.weight_kg || ''}" placeholder="70" min="20" max="300" step="0.1" autocomplete="off">
              <em>kg</em>
            </div>
          </label>
          <label class="settings-field settings-field-wide">
            <span>当前体脂率 <i class="optional">选填</i></span>
            <div class="input-with-unit">
              <input type="number" id="profile-body-fat" class="input" value="${profile.body_fat_pct || ''}" placeholder="${estimatedBodyFat ? `系统估算约 ${estimatedBodyFat}` : '如 18.6'}" min="3" max="60" step="0.1" autocomplete="off">
              <em>%</em>
            </div>
            <small>填写体脂秤或体测实测值后，将优先用于首页与趋势预测；留空则按身体资料估算。</small>
          </label>
          <label class="settings-field settings-field-wide">
            <span>日常活动量 <i>必填</i></span>
            <select id="profile-activity" class="input" autocomplete="off">${activityOptions}</select>
          </label>
        </div>
      </section>

      <section class="settings-section-card">
        <div class="settings-section-head">
          <div><span>02</span><h2>能量目标</h2></div>
          <small>影响每日热量差</small>
        </div>

        <div class="energy-overview">
          <div><small>基础代谢 BMR</small><b>${profile.bmr || '--'}</b><em>kcal</em></div>
          <div><small>首页基础消耗</small><b>${profile.baseline_expenditure || '--'}</b><em>kcal</em></div>
          <div><small>总消耗 TDEE</small><b>${profile.tdee || '--'}</b><em>kcal</em></div>
        </div>

        <label class="settings-field settings-field-wide">
          <span>首页基础消耗</span>
          <div class="input-with-unit">
            <input type="number" id="profile-baseline" class="input"
              value="${profile.baseline_expenditure || ''}" placeholder="保存资料后自动计算"
              min="500" max="5000" step="1"
              data-mode="${profile.baseline_expenditure_is_manual ? 'manual' : 'auto'}">
            <em>kcal/天</em>
          </div>
          <div class="field-helper-row">
            <small id="baseline-mode-text">${profile.baseline_expenditure_is_manual
              ? '正在使用手动设置值'
              : '正在按个人资料自动计算'}</small>
            <button type="button" id="reset-baseline">恢复自动</button>
          </div>
        </label>

        <label class="settings-field settings-field-wide">
          <span>每日热量目标</span>
          <div class="input-with-unit">
            <input type="number" id="goal-input" class="input" value="${dailyGoal}" min="500" max="10000" step="50">
            <em>kcal</em>
          </div>
          <small>用于计算今日还可摄入热量，不会改变基础代谢。</small>
        </label>
      </section>

      <button class="btn btn-primary btn-block settings-save" id="btn-save-all">
        <span>保存全部设置</span>
        <i>同步首页与趋势</i>
      </button>

      <section class="settings-section-card settings-service-card">
        <div class="settings-section-head">
          <div><span>03</span><h2>服务与说明</h2></div>
        </div>
        <div class="settings-service-row">
          <span class="service-icon ai">AI</span>
          <div><b>食物识别服务</b><small>阿里云百练 · ${esc(settings.bailian_model || '未配置模型')}</small></div>
          <em class="${settings.has_bailian_key ? 'online' : 'offline'}">${settings.has_bailian_key ? '已配置' : '未配置'}</em>
        </div>
        <div class="settings-service-row">
          <span class="service-icon server">↗</span>
          <div><b>服务器连接</b><small>当前 CalSnap API 服务</small></div>
          <em id="health-status">检查中</em>
        </div>
        <div class="settings-about">
          <b>CalSnap v1.0</b>
          <p>识别、热量和体脂预测仅用于个人健康记录，不构成医疗建议。</p>
        </div>
      </section>
    `;

    const baselineInput = document.getElementById('profile-baseline');
    const baselineModeText = document.getElementById('baseline-mode-text');
    baselineInput.oninput = () => {
      baselineInput.dataset.mode = 'manual';
      baselineModeText.textContent = '正在使用手动设置值';
    };
    document.getElementById('reset-baseline').onclick = () => {
      baselineInput.dataset.mode = 'auto';
      baselineInput.value = profile.baseline_expenditure || '';
      baselineModeText.textContent = '保存后恢复按个人资料自动计算';
    };

    document.getElementById('btn-save-all').onclick = async () => {
      const button = document.getElementById('btn-save-all');
      const gender = document.getElementById('profile-gender').value;
      const height = Number(document.getElementById('profile-height').value);
      const weight = Number(document.getElementById('profile-weight').value);
      const age = Number(document.getElementById('profile-age').value);
      const bodyFatRaw = document.getElementById('profile-body-fat').value.trim();
      const bodyFat = bodyFatRaw === '' ? null : Number(bodyFatRaw);
      const activity = document.getElementById('profile-activity').value;
      const baseline = Number(baselineInput.value);
      const baselineIsManual = baselineInput.dataset.mode === 'manual';
      const goal = Number(document.getElementById('goal-input').value);

      if (!gender) return showToast('请选择性别');
      if (!height || !weight || !age) return showToast('请填写身高、体重和年龄');
      if (height < 50 || height > 250) return showToast('身高应在 50–250 cm 之间');
      if (weight < 20 || weight > 300) return showToast('体重应在 20–300 kg 之间');
      if (age < 10 || age > 120) return showToast('年龄应在 10–120 岁之间');
      if (bodyFat !== null && (!Number.isFinite(bodyFat) || bodyFat < 3 || bodyFat > 60)) {
        return showToast('体脂率应在 3%–60% 之间');
      }
      if (baselineIsManual && (!baseline || baseline < 500 || baseline > 5000)) {
        return showToast('基础消耗必须在 500–5000 kcal 之间');
      }
      if (!goal || goal < 500 || goal > 10000) {
        return showToast('热量目标应在 500–10000 kcal 之间');
      }

      button.disabled = true;
      button.innerHTML = '<span>保存中...</span><i>正在同步相关页面</i>';
      try {
        await API.updateProfile({
          gender,
          height_cm: height,
          weight_kg: weight,
          age,
          body_fat_pct: bodyFat,
          activity_level: activity,
          baseline_expenditure: baselineIsManual ? baseline : null,
        });
        await API.updateSettings({ daily_cal_goal: String(Math.round(goal)) });
        notifyAppDataChanged('profile_and_goal');
        showToast('设置已保存，首页与趋势已同步');
        await renderSettings();
      } catch (err) {
        button.disabled = false;
        button.innerHTML = '<span>保存全部设置</span><i>同步首页与趋势</i>';
        showToast(err.message || '设置保存失败');
      }
    };

    const ok = await API.healthCheck();
    const healthStatus = document.getElementById('health-status');
    healthStatus.textContent = ok ? '连接正常' : '连接失败';
    healthStatus.className = ok ? 'online' : 'offline';
  } catch {
    showEmpty('⚙️', '无法加载设置', '请检查服务器连接');
  }
}
