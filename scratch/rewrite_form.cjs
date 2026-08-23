const fs = require('fs');

const path = 'src/features/sell/components/PropertyListingForm.jsx';
let content = fs.readFileSync(path, 'utf8');

const replacement = `
        {/* ─────────────────────────────────────────────────────────
            1. 💰 PRICING ENGINE
        ────────────────────────────────────────────────────────── */}
        <div className="glass-card space-y-4 p-5">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            💰 Pricing
          </h3>

          {intent === 'sale' && (
            <div className="space-y-4">
              <Controller
                name="price"
                control={control}
                rules={{ required: 'Required' }}
                render={({ field: { onChange, value, ref } }) => (
                  <Input label="Asking Price *" type="text" placeholder="e.g. 425,000" leftIcon={<span className="font-mono text-xs font-bold">$</span>} error={errors.price?.message} value={value ? new Intl.NumberFormat('en-US').format(value) : ''} onChange={(e) => onChange(e.target.value.replace(/\\D/g, ''))} ref={ref} />
                )}
              />
              <div className="grid grid-cols-3 gap-3 border-t border-[var(--color-border)] pt-4 mt-2">
                <Controller name="hoa_fees" control={control} render={({ field: { onChange, value, ref } }) => (
                  <Input label="HOA fee (/month)" type="text" placeholder="e.g. 250" leftIcon={<span className="font-mono text-xs font-bold">$</span>} value={value ? new Intl.NumberFormat('en-US').format(value) : ''} onChange={(e) => onChange(e.target.value.replace(/\\D/g, ''))} ref={ref} />
                )} />
                <Controller name="property_taxes" control={control} render={({ field: { onChange, value, ref } }) => (
                  <Input label="Property taxes (/year)" type="text" placeholder="e.g. 4,800" leftIcon={<span className="font-mono text-xs font-bold">$</span>} value={value ? new Intl.NumberFormat('en-US').format(value) : ''} onChange={(e) => onChange(e.target.value.replace(/\\D/g, ''))} ref={ref} />
                )} />
                <Controller name="special_assessment" control={control} render={({ field: { onChange, value, ref } }) => (
                  <Input label="Special assessment" type="text" placeholder="e.g. 0" leftIcon={<span className="font-mono text-xs font-bold">$</span>} value={value ? new Intl.NumberFormat('en-US').format(value) : ''} onChange={(e) => onChange(e.target.value.replace(/\\D/g, ''))} ref={ref} />
                )} />
              </div>
            </div>
          )}

          {intent === 'rent' && (
            <div className="space-y-4">
              <Controller
                name="price"
                control={control}
                rules={{ required: 'Required' }}
                render={({ field: { onChange, value, ref } }) => (
                  <Input label="Monthly Rent *" type="text" placeholder="e.g. 2,400" leftIcon={<span className="font-mono text-xs font-bold">$</span>} error={errors.price?.message} value={value ? new Intl.NumberFormat('en-US').format(value) : ''} onChange={(e) => onChange(e.target.value.replace(/\\D/g, ''))} ref={ref} />
                )}
              />
              <div className="grid grid-cols-2 gap-3 border-t border-[var(--color-border)] pt-4 mt-2">
                <Controller name="security_deposit" control={control} render={({ field: { onChange, value, ref } }) => (
                  <Input label="Security deposit" type="text" placeholder="e.g. 2,400" leftIcon={<span className="font-mono text-xs font-bold">$</span>} value={value ? new Intl.NumberFormat('en-US').format(value) : ''} onChange={(e) => onChange(e.target.value.replace(/\\D/g, ''))} ref={ref} />
                )} />
                <Controller name="application_fee" control={control} render={({ field: { onChange, value, ref } }) => (
                  <Input label="Application fee" type="text" placeholder="e.g. 50" leftIcon={<span className="font-mono text-xs font-bold">$</span>} value={value ? new Intl.NumberFormat('en-US').format(value) : ''} onChange={(e) => onChange(e.target.value.replace(/\\D/g, ''))} ref={ref} />
                )} />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <Input label="Lease term" placeholder="e.g. 12 months" {...register('lease_term')} />
                <Input label="Available date" type="date" {...register('available_date')} />
              </div>
              
              <div className="space-y-2 mt-4">
                <label className="text-xs font-semibold text-[var(--color-text-secondary)]">Utilities Included</label>
                <div className="flex flex-wrap gap-4">
                  {['Water', 'Electricity', 'Gas', 'Internet', 'Trash'].map((util) => (
                    <label key={util} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" value={util} className="rounded border-[var(--color-border)] text-brand-500 focus:ring-brand-500" {...register('utilities_included')} />
                      <span className="text-sm">{util}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {intent === 'lease' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[var(--color-text-secondary)]">Lease rate type</label>
                <div className="flex gap-4">
                  {[
                    { value: 'sqft_year', label: '$/SF/year' },
                    { value: 'month', label: '$/month' },
                    { value: 'contact', label: 'Contact for pricing' }
                  ].map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" value={opt.value} className="text-brand-500 focus:ring-brand-500" {...register('lease_price_type')} />
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Controller
                  name="price"
                  control={control}
                  rules={{ required: 'Required' }}
                  render={({ field: { onChange, value, ref } }) => (
                    <Input label="Lease rate *" type="text" placeholder="e.g. 28" leftIcon={<span className="font-mono text-xs font-bold">$</span>} error={errors.price?.message} value={value ? new Intl.NumberFormat('en-US').format(value) : ''} onChange={(e) => onChange(e.target.value.replace(/\\D/g, ''))} ref={ref} />
                  )}
                />
                <Input label="Available space (SF) *" type="number" placeholder="2500" error={errors.available_space?.message} {...register('available_space', { required: 'Required' })} />
              </div>
              
              {watch('lease_price_type') === 'sqft_year' && watch('price') && watch('available_space') && (
                <div className="bg-[var(--color-surface-elevated)] p-3 rounded-xl border border-[var(--color-border)]">
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Estimated monthly rent: <span className="font-bold text-[var(--color-text-primary)]">$\\{new Intl.NumberFormat('en-US').format(Math.round((Number(watch('price')) * Number(watch('available_space'))) / 12))\\}</span>
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 border-t border-[var(--color-border)] pt-4 mt-2">
                <Input label="CAM charges / NNN" placeholder="e.g. $5 / SF" {...register('cam_nnn')} />
                <Controller name="build_out_allowance" control={control} render={({ field: { onChange, value, ref } }) => (
                  <Input label="Build-out allowance" type="text" placeholder="e.g. 10,000" leftIcon={<span className="font-mono text-xs font-bold">$</span>} value={value ? new Intl.NumberFormat('en-US').format(value) : ''} onChange={(e) => onChange(e.target.value.replace(/\\D/g, ''))} ref={ref} />
                )} />
              </div>
            </div>
          )}

          {intent === 'vacation' && (
            <div className="space-y-4">
              <Controller
                name="price"
                control={control}
                rules={{ required: 'Required' }}
                render={({ field: { onChange, value, ref } }) => (
                  <Input label="Nightly rate *" type="text" placeholder="e.g. 350" leftIcon={<span className="font-mono text-xs font-bold">$</span>} error={errors.price?.message} value={value ? new Intl.NumberFormat('en-US').format(value) : ''} onChange={(e) => onChange(e.target.value.replace(/\\D/g, ''))} ref={ref} />
                )}
              />
              <div className="grid grid-cols-2 gap-3 border-t border-[var(--color-border)] pt-4 mt-2">
                <Controller name="weekend_rate" control={control} render={({ field: { onChange, value, ref } }) => (
                  <Input label="Weekend rate" type="text" placeholder="e.g. 400" leftIcon={<span className="font-mono text-xs font-bold">$</span>} value={value ? new Intl.NumberFormat('en-US').format(value) : ''} onChange={(e) => onChange(e.target.value.replace(/\\D/g, ''))} ref={ref} />
                )} />
                <Controller name="cleaning_fee" control={control} render={({ field: { onChange, value, ref } }) => (
                  <Input label="Cleaning fee" type="text" placeholder="e.g. 100" leftIcon={<span className="font-mono text-xs font-bold">$</span>} value={value ? new Intl.NumberFormat('en-US').format(value) : ''} onChange={(e) => onChange(e.target.value.replace(/\\D/g, ''))} ref={ref} />
                )} />
                <Controller name="security_deposit" control={control} render={({ field: { onChange, value, ref } }) => (
                  <Input label="Security deposit" type="text" placeholder="e.g. 250" leftIcon={<span className="font-mono text-xs font-bold">$</span>} value={value ? new Intl.NumberFormat('en-US').format(value) : ''} onChange={(e) => onChange(e.target.value.replace(/\\D/g, ''))} ref={ref} />
                )} />
                <Controller name="additional_guest_fee" control={control} render={({ field: { onChange, value, ref } }) => (
                  <Input label="Additional guest fee" type="text" placeholder="e.g. 25" leftIcon={<span className="font-mono text-xs font-bold">$</span>} value={value ? new Intl.NumberFormat('en-US').format(value) : ''} onChange={(e) => onChange(e.target.value.replace(/\\D/g, ''))} ref={ref} />
                )} />
              </div>
              <div className="grid grid-cols-3 gap-3 mt-2">
                <Input label="Min stay (nights)" type="number" placeholder="2" {...register('min_stay')} />
                <Input label="Max stay (nights)" type="number" placeholder="30" {...register('max_guests')} />
                <Input label="Available from" type="date" {...register('available_date')} />
              </div>
            </div>
          )}
        </div>

        {/* ─────────────────────────────────────────────────────────
            2. PROPERTY DETAILS (Non-financial)
        ────────────────────────────────────────────────────────── */}
        <div className="glass-card space-y-4 p-5">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            🏠 Property Details
          </h3>

          {isLand ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Acreage *" type="number" step="0.01" placeholder="2.5" error={errors.acreage?.message} {...register('acreage', { required: 'Required' })} />
                <Input label="Lot Size" placeholder="e.g. 100 x 250 ft" {...register('lot_size')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Zoning" placeholder="e.g. Residential, Commercial" {...register('zoning')} />
                <Select label="Road Access" options={[{ value: 'paved', label: 'Paved Road' }, { value: 'dirt', label: 'Dirt Road' }, { value: 'none', label: 'No Access' }]} {...register('road_access')} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Select label="Water" options={[{ value: 'available', label: 'Available' }, { value: 'none', label: 'None' }]} {...register('water')} />
                <Select label="Sewer" options={[{ value: 'available', label: 'Available' }, { value: 'none', label: 'None' }]} {...register('sewer')} />
                <Select label="Electricity" options={[{ value: 'available', label: 'Available' }, { value: 'none', label: 'None' }]} {...register('electricity')} />
              </div>
            </div>
          ) : intent === 'lease' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <Input label="Building Size (SF)" type="number" placeholder="10000" {...register('building_size')} />
                <Input label="Ceiling Height (ft)" type="number" placeholder="18" {...register('ceiling_height')} />
                <Select label="Loading Dock" options={[{ value: 'No', label: 'No' }, { value: 'Yes', label: 'Yes' }]} {...register('loading_dock')} />
              </div>
              <div className="grid grid-cols-3 gap-3 mt-3">
                <Input label="Zoning Code" placeholder="e.g. CMX-2" {...register('zoning')} />
                <Input label="Parking Spaces" type="number" placeholder="15" {...register('parking_spaces')} />
                <Input label="HVAC System" placeholder="e.g. Central Air" {...register('hvac')} />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Select label="Bedrooms" options={BEDROOM_OPTIONS} {...register('bedrooms')} />
                <Select label="Bathrooms" options={BATHROOM_OPTIONS} {...register('bathrooms')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Square Feet" type="number" placeholder="1500" {...register('area_size')} />
                {intent === 'sale' && <Input label="Year Built" type="number" placeholder="2018" {...register('construction_year')} />}
                {intent === 'rent' && <Select label="Pet Policy" options={[{ value: 'negotiable', label: 'Negotiable' }, { value: 'dogs_cats', label: 'Dogs & Cats Allowed' }, { value: 'no_pets', label: 'No Pets Allowed' }]} {...register('pet_policy')} />}
              </div>
            </div>
          )}
        </div>

        {/* ─────────────────────────────────────────────────────────
            3. FEATURES
        ────────────────────────────────────────────────────────── */}
        {!isLand && (
          <div className="glass-card space-y-3 p-5">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              ✨ Features & Amenities
            </h3>
            <div className="flex flex-wrap gap-2">
              {REAL_ESTATE_FEATURES.map((f) => {
                const sel = selectedFeatures.includes(f.key);
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => toggleFeature(f.key)}
                    className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all"
                    style={{
                      backgroundColor: sel ? 'rgba(16,185,129,0.15)' : 'var(--color-surface-elevated)',
                      border: \`1px solid \${sel ? '#10B981' : 'var(--color-border)'}\`,
                      color: sel ? '#10B981' : 'var(--color-text-secondary)',
                    }}
                  >
                    {f.emoji} {f.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────
            4. 📍 PROPERTY LOCATION
        ────────────────────────────────────────────────────────── */}
        <div className="glass-card space-y-4 p-5">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            📍 Property Location
          </h3>
          
          <Input
            label="Property Address *"
            placeholder="e.g. 123 Main St, Philadelphia, PA"
            hint="Your full address is securely stored and used to verify the listing."
            error={errors.address?.message}
            {...register('address', { required: 'Required' })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input label="City *" placeholder="Philadelphia" error={errors.city?.message} {...register('city', { required: 'Required' })} />
            <Input label="State *" placeholder="PA" error={errors.state?.message} {...register('state', { required: 'Required' })} />
          </div>

          <div className="space-y-3 pt-4 border-t border-[var(--color-border)] mt-2">
            <label className="text-xs font-semibold text-[var(--color-text-secondary)]">What should buyers see?</label>
            <div className="flex flex-col gap-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  value="approximate"
                  className="mt-1 text-brand-500 focus:ring-brand-500"
                  {...register('location_type')}
                />
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">Approximate location</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">Show neighborhood/area only</p>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  value="exact"
                  className="mt-1 text-brand-500 focus:ring-brand-500"
                  {...register('location_type')}
                />
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">Exact location</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">Show the property’s exact location</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────
            SUBMIT
        ────────────────────────────────────────────────────────── */}
        <div className="pt-4 flex gap-3">
          <Button type="submit" className="w-full" isLoading={createMutation.isPending}>
            Publish Listing
          </Button>
        </div>
      </form>
    </div>
  );
}
`;

const startMarker = "{/* Dynamic Detail Cards */}";
const startIndex = content.indexOf(startMarker);

const endIndex = content.lastIndexOf("</form>");

if (startIndex !== -1 && endIndex !== -1) {
  const newContent = content.substring(0, startIndex) + replacement;
  fs.writeFileSync(path, newContent, 'utf8');
  console.log("Successfully replaced UI sections");
} else {
  console.log("Failed to find markers", startIndex, endIndex);
}
